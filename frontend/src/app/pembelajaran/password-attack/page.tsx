"use client";

import ModuleViewer from "@/components/ModuleViewer";
import data from "./password.json";

export default function PasswordAttackPage() {
  return <ModuleViewer slug="password-attack" data={data} />;
}
