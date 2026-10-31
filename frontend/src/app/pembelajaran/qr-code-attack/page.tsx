"use client";

import ModuleViewer from "@/components/ModuleViewer";
import data from "./qr-code-attack.json";

export default function QrCodeAttackPage() {
  return <ModuleViewer slug="qr-code-attack" data={data} />;
}
