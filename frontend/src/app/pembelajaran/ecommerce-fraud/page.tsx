"use client";

import ModuleViewer from "@/components/ModuleViewer";
import data from "./ecommerce-fraud.json";

export default function EcommerceFraudPage() {
  return <ModuleViewer slug="ecommerce-fraud" data={data} />;
}
