"use client";

import ModuleViewer from "@/components/ModuleViewer";
import data from "./web-attack.json";

export default function WebAttackPage() {
  return <ModuleViewer slug="web-attack" data={data} />;
}
