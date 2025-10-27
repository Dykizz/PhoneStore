import { useContext } from "react";
import { NotificationContext } from "@/providers/NotificationProvider";

export const useGlobalNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useGlobalNotification must be used within NotificationProvider"
    );
  return ctx;
};
