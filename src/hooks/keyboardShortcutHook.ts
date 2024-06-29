import { Logger } from "@/lib/logger";
import { Key, useEffect } from "react";

export const useKeyboardShortcut = (
    keys: Key[],
    callback: () => void
  ) => {
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          keys.every(
            (key) =>
              (key === "ctrl" && event.ctrlKey) ||
              (key === "shift" && event.shiftKey) ||
              (key === "alt" && event.altKey) ||
              (typeof key === "string" && event.key.toLowerCase() === key.toLowerCase())
          )
        ) {
            event.preventDefault();
          callback();
        }
      };
  
      window.addEventListener("keydown", handleKeyDown);
  
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [keys, callback]);
  };