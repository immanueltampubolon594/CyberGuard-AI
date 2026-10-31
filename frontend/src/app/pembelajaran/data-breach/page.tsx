"use client";

import ModuleViewer from "@/components/ModuleViewer";
import data from "./data-breach.json";

export default function DataBreachPage() {
  return <ModuleViewer slug="data-breach" data={data} />;
}
