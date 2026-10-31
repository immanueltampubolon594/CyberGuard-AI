"use client";

import ModuleViewer from "@/components/ModuleViewer";
import data from "./ai-attack.json";

export default function AiAttackPage() {
  return <ModuleViewer slug="ai-attack" data={data} />;
}
