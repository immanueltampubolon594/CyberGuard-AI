"use client";

import ModuleViewer from "@/components/ModuleViewer";
import data from "./phishing.json";

export default function PhishingPage() {
  return <ModuleViewer slug="phishing" data={data} />;
}
