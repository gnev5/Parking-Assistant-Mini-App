import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ArrowLeft, Bell, Calendar, MapPin, User } from "lucide-react";
import { hapticFeedback } from "@/app/components/TelegramWebApp";
import { useTranslation } from "@/app/i18n/useTranslation";

interface NotificationsProps {
  userId: string;
  userLanguage: string;
  onBack: () => void;
  apiUrl: string;
  apiKey: string;
}

export default function Notifications({ userId, userLanguage, onBack, apiUrl, apiKey }: NotificationsProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation(userLanguage as "en" | "ru");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString(userLanguage === "ru" ? "ru-RU" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case "offer":
        return <MapPin className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "booking":
        return "bg-blue-50 border-blue-200";
      case "offer":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{t("notifications")}</h1>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">{t("loading")}</div>
        ) : notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">{t("noNotifications")}</h3>
            <p className="text-gray-600">{t("noNotificationsDesc")}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.notificationId}
                className={`p-4 border-l-4 ${getNotificationColor(notification.type)}`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-gray-900 font-medium">
                      {notification.message}
                    </p>
                    
                    {notification.type === "booking" && (
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDateTime(notification.parkingFrom)}
                            {notification.parkingTo && ` - ${formatDateTime(notification.parkingTo)}`}
                          </span>
                        </div>
                      </div>
                    )}

                    {notification.type === "offer" && (
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDateTime(notification.requestedFrom)}
                            {notification.requestedTo && ` - ${formatDateTime(notification.requestedTo)}`}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      {formatDateTime(notification.createdAt)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
