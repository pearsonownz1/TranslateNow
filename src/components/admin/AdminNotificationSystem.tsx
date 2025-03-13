import React, { useEffect } from "react";
import { useToast } from "../ui/use-toast";

interface AdminNotificationSystemProps {
  notifications: Array<{
    id: string;
    type: "order_completed" | "document_uploaded" | "message_sent";
    orderId: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
  }>;
  onNotificationRead: (notificationId: string) => void;
}

const AdminNotificationSystem = ({
  notifications,
  onNotificationRead,
}: AdminNotificationSystemProps) => {
  const { toast } = useToast();

  // Show toast for new notifications
  useEffect(() => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);

    if (unreadNotifications.length > 0) {
      // Only show the most recent notification as a toast
      const latestNotification = unreadNotifications.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      )[0];

      toast({
        title: getNotificationTitle(latestNotification.type),
        description: latestNotification.message,
        onOpenChange: () => onNotificationRead(latestNotification.id),
      });
    }
  }, [notifications]);

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case "order_completed":
        return "Order Completed";
      case "document_uploaded":
        return "Document Uploaded";
      case "message_sent":
        return "New Message";
      default:
        return "Notification";
    }
  };

  return null; // This component doesn't render anything, it just shows toasts
};

export default AdminNotificationSystem;
