import { useEffect, useRef, useSyncExternalStore } from "react";
import { locationStore } from "../header/location-store";
export function useAccurateLocation(onSuccess) {
  const state = useSyncExternalStore(locationStore.subscribe, locationStore.getSnapshot, locationStore.getSnapshot);
  const callback = useRef(onSuccess); callback.current = onSuccess;
  useEffect(() => { if (state.position) callback.current?.(state.position); }, [state.position]);
  return { ...state, request: locationStore.request };
}
