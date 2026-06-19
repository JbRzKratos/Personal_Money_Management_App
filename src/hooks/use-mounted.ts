import { useEffect, useState } from "react";

/**
 * Hook to detect client-side mounting.
 * Prevents hydration mismatches with localStorage-backed stores.
 */
export function useMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
