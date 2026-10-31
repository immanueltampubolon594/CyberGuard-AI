"use client";

// Satu-satunya pintu komponen ke data progress.
// Saat dihubungkan ke backend, ubah isi hook ini (fetch /learning/progress,
// POST /learning/step/complete, dst.) tanpa menyentuh komponen tampilan.

import { useCallback, useEffect, useState } from "react";
import {
  SYNC_EVENT,
  completeStep,
  readStore,
  resetModule,
  submitQuiz,
  type LearningStore,
} from "./learningApi";

export function useLearning() {
  const [store, setStore] = useState<LearningStore>({});
  const [ready, setReady] = useState(false);

  const reload = useCallback(() => setStore(readStore()), []);

  useEffect(() => {
    reload();
    setReady(true);
    window.addEventListener(SYNC_EVENT, reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener(SYNC_EVENT, reload);
      window.removeEventListener("storage", reload);
    };
  }, [reload]);

  return { store, ready, completeStep, submitQuiz, resetModule };
}
