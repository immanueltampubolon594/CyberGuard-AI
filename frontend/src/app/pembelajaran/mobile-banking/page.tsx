"use client";

import ModuleViewer from "@/components/ModuleViewer";
import data from "./mobile-banking.json";

export default function MobileBankingPage() {
  return <ModuleViewer slug="mobile-banking" data={data} />;
}
