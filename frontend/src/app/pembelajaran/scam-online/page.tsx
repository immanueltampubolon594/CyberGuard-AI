"use client";

import ModuleViewer from "@/components/ModuleViewer";
import data from "./scam-online.json";

export default function ScamOnlinePage() {
  return <ModuleViewer slug="scam-online" data={data} />;
}
