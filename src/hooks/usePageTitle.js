import { useEffect } from "react";

/** Set the document title as "<title> · PowerPulse". */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · PowerPulse` : "PowerPulse";
  }, [title]);
}
