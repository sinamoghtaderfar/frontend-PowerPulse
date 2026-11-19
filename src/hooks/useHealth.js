import { useEffect, useState } from "react";
import { getHealth, isAbortError } from "../api/forecastApi";

/** API health from `/health`: `{ status: "loading" | "healthy" | "degraded" | "offline", models }`. */
export function useHealth() {
  const [health, setHealth] = useState({ status: "loading", models: null, apiVersion: null });

  useEffect(() => {
    const controller = new AbortController();
    getHealth({ signal: controller.signal })
      .then((result) => setHealth(result))
      .catch((error) => {
        if (controller.signal.aborted || isAbortError(error)) return;
        setHealth({ status: "offline", models: null, apiVersion: null });
      });
    return () => controller.abort();
  }, []);

  return health;
}
