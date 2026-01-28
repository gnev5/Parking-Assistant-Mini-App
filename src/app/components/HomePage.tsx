import { PlusCircle, Search, Users, Car, MapPin, Bell } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { hapticFeedback } from "@/app/components/TelegramWebApp";
import { useTranslation } from "@/app/i18n/useTranslation";

interface HomePageProps {
  userProfile: any;
  onNavigate: (view: string) => void;
}

export default function HomePage({ userProfile, onNavigate }: HomePageProps) {
  const { t } = useTranslation(userProfile?.language || "en");
  
  const handleNavigate = (view: string) => {
    hapticFeedback("light");
    onNavigate(view);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Car className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t("parkShare")}</h1>
          </div>
          <p className="text-gray-600">{t("parkingAssistant")}</p>
        </div>

        {/* User Info Card */}
        {userProfile && (
          <Card className="p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{userProfile.name}</p>
                <p className="text-sm text-gray-500">
                  {userProfile.isOwner ? "🅿️ " + t("parkingOwner") : "👤 " + t("regularUser")}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleNavigate("profile")}
              >
                {t("editProfile")}
              </Button>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">{t("welcome")}</h2>
          
          {userProfile?.isOwner && (
            <>
              <Card 
                className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleNavigate("my-spaces")}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{t("mySpaces")}</h3>
                    <p className="text-sm text-blue-100">{userProfile.language === "ru" ? "Управление вашими местами" : "Manage your spaces"}</p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleNavigate("create-listing")}
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className="w-6 h-6" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{t("createListing")}</h3>
                    <p className="text-sm text-green-100">{userProfile.language === "ru" ? "Продайте, сдайте или поделитесь" : "Sell, rent, or share your space"}</p>
                  </div>
                </div>
              </Card>
            </>
          )}

          <Card 
            className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleNavigate("browse-listings")}
          >
            <div className="flex items-center gap-3">
              <Search className="w-6 h-6" />
              <div className="flex-1">
                <h3 className="font-semibold">{t("browseListings")}</h3>
                <p className="text-sm text-purple-100">{userProfile.language === "ru" ? "Найдите доступную парковку" : "Find available parking"}</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleNavigate("create-request")}
          >
            <div className="flex items-center gap-3">
              <PlusCircle className="w-6 h-6" />
              <div className="flex-1">
                <h3 className="font-semibold">{t("createRequest")}</h3>
                <p className="text-sm text-orange-100">{userProfile.language === "ru" ? "Ищете парковку?" : "Looking for parking?"}</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleNavigate("browse-requests")}
          >
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              <div className="flex-1">
                <h3 className="font-semibold">{t("browseRequests")}</h3>
                <p className="text-sm text-pink-100">{userProfile.language === "ru" ? "Смотрите, что нужно другим" : "See what others need"}</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleNavigate("notifications")}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6" />
              <div className="flex-1">
                <h3 className="font-semibold">{t("notifications")}</h3>
                <p className="text-sm text-amber-100">{userProfile.language === "ru" ? "Ваши бронирования и предложения" : "Your bookings and offers"}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">
            {userProfile?.language === "ru" ? "Как это работает" : "How it works"}
          </h3>
          <ul className="space-y-1 text-sm text-blue-800">
            {userProfile?.language === "ru" ? (
              <>
                <li>• Владельцы могут размещать места на продажу, аренду или гостевую парковку</li>
                <li>• Участники могут публиковать запросы на парковку</li>
                <li>• Свяжитесь друг с другом через Telegram</li>
                <li>• Делитесь доступностью парковки с сообществом</li>
              </>
            ) : (
              <>
                <li>• Owners can list spaces for sale, rent, or guest parking</li>
                <li>• Members can post requests for parking needs</li>
                <li>• Contact each other directly via Telegram</li>
                <li>• Share parking availability with the community</li>
              </>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}