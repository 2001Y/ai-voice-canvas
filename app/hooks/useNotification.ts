import { useCallback, useState } from "react";

export const useNotification = () => {
  const [notification, setNotification] = useState<{
    message: string;
    type: string;
  } | null>(null);

  const showNotification = useCallback((message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
    alert(message); // ブラウザアラートも表示
  }, []);

  return { notification, showNotification };
};
