import { lineClient, lineBlobClient } from "@/src/lib/line/client";
import { serverEnv } from "@/src/config/env";

/**
 * One-time rich menu setup: create the menu (3 tap areas), upload its image,
 * and set it as the default for all users. Idempotent-ish: deletes existing
 * menus first so re-running replaces rather than piling up.
 *
 * Layout (2500x843, four equal columns of 625px):
 *   [ FAQ ] [ ABOUT ] [ CONTACT ] [ AI CHAT ]
 *   FAQ/ABOUT/CONTACT -> web pages (uri); AI CHAT -> postback (menu=ai).
 */
export async function setupRichMenu(): Promise<{ richMenuId: string }> {
  const client = lineClient();

  // remove any existing menus so we don't accumulate duplicates
  const existing = await client.getRichMenuList();
  for (const m of existing.richmenus) {
    await client.deleteRichMenu(m.richMenuId).catch(() => undefined);
  }

  // rich menu tap areas open the public web pages
  const base = serverEnv.publicBaseUrl;

  // 2500x843 = compact rich menu; 3 columns of ~833px
  const richMenuId = (
    await client.createRichMenu({
      size: { width: 2500, height: 843 },
      selected: true,
      name: "tsl-main-menu",
      chatBarText: "メニュー",
      areas: [
        {
          // FAQ -> /faq page
          bounds: { x: 0, y: 0, width: 625, height: 843 },
          action: { type: "uri", label: "FAQ", uri: `${base}/faq` },
        },
        {
          // ABOUT -> /about page
          bounds: { x: 625, y: 0, width: 625, height: 843 },
          action: { type: "uri", label: "ABOUT", uri: `${base}/about` },
        },
        {
          // CONTACT -> /contact page
          bounds: { x: 1250, y: 0, width: 625, height: 843 },
          action: { type: "uri", label: "CONTACT", uri: `${base}/contact` },
        },
        {
          // AI CHAT -> postback (handled in the webhook -> AI concierge intro)
          bounds: { x: 1875, y: 0, width: 625, height: 843 },
          action: { type: "postback", label: "AI CHAT", data: "menu=ai", displayText: "AIに相談する" },
        },
      ],
    })
  ).richMenuId;

  // upload the menu image (must be fetched as a binary blob)
  const imgUrl = `${serverEnv.publicBaseUrl}/richmenu.png`;
  const res = await fetch(imgUrl);
  if (!res.ok) throw new Error(`failed to fetch richmenu image: ${res.status}`);
  const arrayBuf = await res.arrayBuffer();
  const blob = new Blob([arrayBuf], { type: "image/png" });
  await lineBlobClient().setRichMenuImage(richMenuId, blob);

  // set as default for all users
  await client.setDefaultRichMenu(richMenuId);

  return { richMenuId };
}
