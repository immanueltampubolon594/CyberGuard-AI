"use client";

import ModuleViewer from "@/components/ModuleViewer";
import data from "./social-engineering.json";

export default function SocialEngineeringPage() {
  return <ModuleViewer slug="social-engineering" data={data} />;
}
