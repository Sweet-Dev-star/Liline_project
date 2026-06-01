import { lineClient, lineBlobClient } from "@/src/lib/line/client";
import { serverEnv } from "@/src/config/env";

/**
 * One-time rich menu setup: create the menu (3 tap areas), upload its image,
 * and set it as the default for all users. Idempotent-ish: deletes existing
 * menus first so re-running replaces rather than piling up.
 *
 * Layout (2500x843, three equal columns):
 *   [ FAQ ] [ ABOUT ] [ CONTACT ]  -> each sends a postback handled in the webhook
 */
export async function setupRichMenu(): Promise<{ richMenuId: string }> {
  const client = lineClient();

  // remove any existing menus so we don't accumulate duplicates
  const existing = await client.getRichMenuList();
  for (const m of existing.richmenus) {
    await client.deleteRichMenu(m.richMenuId).catch(() => undefined);
  }

  // 2500x843 = compact rich menu; 3 columns of ~833px
  const richMenuId = (
    await client.createRichMenu({
      size: { width: 2500, height: 843 },
      selected: true,
      name: "tsl-main-menu",
      chatBarText: "メニュー",
      areas: [
        {
          bounds: { x: 0, y: 0, width: 833, height: 843 },
          action: { type: "postback", data: "menu=faq", displayText: "よくある質問" },
        },
        {
          bounds: { x: 833, y: 0, width: 834, height: 843 },
          action: { type: "postback", data: "menu=about", displayText: "運営者について" },
        },
        {
          bounds: { x: 1667, y: 0, width: 833, height: 843 },
          action: { type: "postback", data: "menu=contact", displayText: "お問い合わせ" },
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
  await lineBlobClient.setRichMenuImage(richMenuId, blob);

  // set as default for all users
  await client.setDefaultRichMenu(richMenuId);

  return { richMenuId };
}
