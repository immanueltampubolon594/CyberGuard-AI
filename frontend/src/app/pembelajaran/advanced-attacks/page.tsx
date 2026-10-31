"use client";

import ModuleViewer from "@/components/ModuleViewer";
import data from "./advanced-attacks.json";

export default function AdvancedAttacksPage() {
  return <ModuleViewer slug="advanced-attacks" data={data} />;
}
