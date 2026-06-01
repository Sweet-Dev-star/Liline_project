import { SurveyApp } from "@/src/features/survey/SurveyApp";
import { publicEnv } from "@/src/config/env";

// the LIFF experience: video-bg intro -> 3-question survey
export const dynamic = "force-dynamic";

export default function LiffPage() {
  return <SurveyApp liffId={publicEnv.liffId} videoUrl={publicEnv.mainVideoUrl} />;
}
