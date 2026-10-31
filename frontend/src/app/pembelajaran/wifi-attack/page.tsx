"use client";

import ModuleViewer from "@/components/ModuleViewer";
import data from "./wifi-attack.json";

export default function WifiAttackPage() {
  return <ModuleViewer slug="wifi-attack" data={data} />;
}
