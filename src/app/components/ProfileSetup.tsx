import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card } from "@/app/components/ui/card";
import { Switch } from "@/app/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/app/i18n/useTranslation";

interface ProfileSetupProps {
  userProfile: any;
  onSave: (profile: any) => void;
  onBack: () => void;
}

export default function ProfileSetup({ userProfile, onSave, onBack }: ProfileSetupProps) {
  const [name, setName] = useState(userProfile?.name || "");
  const [telegramUsername, setTelegramUsername] = useState(userProfile?.telegramUsername || "");
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || "");
  const [isOwner, setIsOwner] = useState(userProfile?.isOwner || false);
  const [language, setLanguage] = useState(userProfile?.language || "en");
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation(language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const profile = {
      name,
      telegramUsername,
      phoneNumber,
      isOwner,
      language,
    };
    
    await onSave(profile);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("profileSetup")}
          </h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")} *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram">{t("telegramUsername")}</Label>
              <Input
                id="telegram"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                placeholder={t("telegramUsernamePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("phoneNumber")}</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t("phoneNumberPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">{t("language")}</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder={t("selectLanguage")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("english")}</SelectItem>
                  <SelectItem value="ru">{t("russian")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="owner-toggle" className="font-semibold text-gray-900">
                  {t("parkingOwner")}
                </Label>
                <p className="text-sm text-gray-600">{t("parkingOwnerDesc")}</p>
              </div>
              <Switch
                id="owner-toggle"
                checked={isOwner}
                onCheckedChange={setIsOwner}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !name}
            >
              {loading ? `${t("loading")}` : t("saveProfile")}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}