import { useEffect, useState } from "react";
import { subscribe, unsubscribe } from "../utils/events";

export function useDialogState() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const showHandler = () => setIsOpen(true);
    const hideHandler = () => setIsOpen(false);

    subscribe("showDialog", showHandler);
    subscribe("hideDialog", hideHandler);

    return () => {
      unsubscribe("showDialog", showHandler);
      unsubscribe("hideDialog", hideHandler);
    };
  }, []);

  return { isOpen, setIsOpen };
}