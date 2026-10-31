"use client";

import ModuleViewer from "@/components/ModuleViewer";
import data from "./ddos.json";

export default function DdosPage() {
  return <ModuleViewer slug="ddos" data={data} />;
}
