import { useCallback } from "react";
import { notification } from "antd";
import type { ArgsProps } from "antd/es/notification";

type NotificationType = "success" | "info" | "warning" | "error";

interface NotificationOptions extends Omit<ArgsProps, "type"> {
  type?: NotificationType;
}

export const useNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  const showNotification = useCallback(
    (options: NotificationOptions) => {
      const { type = "info", ...rest } = options;
      api[type]({
        ...rest,
        placement: "topRight",
      });
    },
    [api]
  );

  const successNotification = useCallback(
    (
      message: string,
      description?: string,
      options?: Omit<ArgsProps, "message" | "description">
    ) => {
      api.success({
        message,
        description,
        ...options,
        placement: "topRight",
      });
    },
    [api]
  );

  const errorNotification = useCallback(
    (
      message: string,
      description?: string,
      options?: Omit<ArgsProps, "message" | "description">
    ) => {
      api.error({
        message,
        description,
        ...options,
        placement: "topRight",
      });
    },
    [api]
  );

  const warningNotification = useCallback(
    (
      message: string,
      description?: string,
      options?: Omit<ArgsProps, "message" | "description">
    ) => {
      api.warning({
        message,
        description,
        ...options,
        placement: "topRight",
      });
    },
    [api]
  );

  const infoNotification = useCallback(
    (
      message: string,
      description?: string,
      options?: Omit<ArgsProps, "message" | "description">
    ) => {
      api.info({
        message,
        description,
        ...options,
        placement: "topRight",
      });
    },
    [api]
  );

  return {
    contextHolder,
    showNotification,
    successNotification,
    errorNotification,
    warningNotification,
    infoNotification,
  };
};
