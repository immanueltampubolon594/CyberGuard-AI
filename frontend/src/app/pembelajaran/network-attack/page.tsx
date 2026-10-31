"use client";

import ModuleViewer from "@/components/ModuleViewer";
import data from "./network-attack.json";

export default function NetworkAttackPage() {
  return <ModuleViewer slug="network-attack" data={data} />;
}
