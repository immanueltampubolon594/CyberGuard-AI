"use client";

import ModuleViewer from "@/components/ModuleViewer";
import data from "./account-takeover.json";

export default function AccountTakeoverPage() {
  return <ModuleViewer slug="account-takeover" data={data} />;
}
