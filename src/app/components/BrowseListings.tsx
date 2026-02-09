import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ArrowLeft, MapPin, DollarSign, Calendar, MessageCircle, Phone, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { openTelegramUser, hapticFeedback } from "@/app/components/TelegramWebApp";
import { toast } from "sonner";
import { useTranslation } from "@/app/i18n/useTranslation";

interface BrowseListingsProps {
  userId: string;
  userLanguage: string;
  onBack: () => void;
  apiUrl: string;
  apiKey: string;
}

export default function BrowseListings({ userId, userLanguage, onBack, apiUrl, apiKey }: BrowseListingsProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [bookingData, setBookingData] = useState({
    parkingFrom: "",
    parkingTo: "",
  });
  const [booking, setBooking] = useState(false);
  const { t } = useTranslation(userLanguage as "en" | "ru");

  useEffect(() => {
    fetchListings(filter === "all" ? undefined : filter);
  }, [filter]);

  const fetchListings = async (type?: string) => {
    setLoading(true);
    try {
      const url = type ? `${apiUrl}/listings?type=${type}` : `${apiUrl}/listings`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "sale": return t("lookingToBuy");
      case "rent-long": return t("lookingForRental");
      case "short-term": return t("needGuestParking");
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "sale": return "bg-green-100 text-green-800";
      case "rent-long": return "bg-blue-100 text-blue-800";
      case "short-term": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", { 
      month: "short", 
      day: "numeric", 
      hour: "numeric", 
      minute: "2-digit" 
    });
  };

  const formatDateTimeForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Format to YYYY-MM-DDTHH:MM for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const openTelegram = (username: string) => {
    hapticFeedback("light");
    openTelegramUser(username);
  };

  const handleBookSpace = (listing: any) => {
    setSelectedListing(listing);
    setBookingData({
      parkingFrom: formatDateTimeForInput(listing.availableFrom) || "",
      parkingTo: formatDateTimeForInput(listing.availableTo) || "",
    });
    setShowBookingDialog(true);
  };

  const confirmBooking = async () => {
    if (!bookingData.parkingFrom || !bookingData.parkingTo) {
      toast.error("Please fill in all fields");
      return;
    }

    setBooking(true);
    try {
      const response = await fetch(`${apiUrl}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          listingId: selectedListing.listingId,
          userId,
          parkingFrom: bookingData.parkingFrom,
          parkingTo: bookingData.parkingTo,
        }),
      });

      if (response.ok) {
        hapticFeedback("success");
        toast.success(t("bookingSuccess"));
        setShowBookingDialog(false);
        setBookingData({ parkingFrom: "", parkingTo: "" });
        // Refresh listings to remove the booked one
        fetchListings(filter === "all" ? undefined : filter);
      } else {
        hapticFeedback("error");
        const errorData = await response.json();
        toast.error(errorData.error || t("bookingFailed"));
      }
    } catch (error) {
      console.error("Error booking space:", error);
      hapticFeedback("error");
      toast.error(t("bookingFailed"));
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{t("browseListingsTitle")}</h1>
        </div>

        <Tabs defaultValue="all" onValueChange={setFilter} className="mb-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">{t("all")}</TabsTrigger>
            <TabsTrigger value="sale">{t("sale")}</TabsTrigger>
            <TabsTrigger value="rent-long">{t("rental")}</TabsTrigger>
            <TabsTrigger value="short-term">{t("guest")}</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-12 text-gray-500">{t("loading")}</div>
        ) : listings.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">{t("noListingsFound")}</h3>
            <p className="text-gray-600">{t("checkBackLater")}</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <Card key={listing.listingId} className="p-4 hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{listing.title}</h3>
                      <Badge className={`mt-1 ${getTypeBadgeColor(listing.type)}`}>
                        {getTypeLabel(listing.type)}
                      </Badge>
                    </div>
                    {listing.price && (
                      <div className="text-right">
                        <div className="font-bold text-lg text-green-600">{listing.price}</div>
                        {listing.type === "rent-long" && (
                          <div className="text-xs text-gray-500">{t("perMonth")}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Space Info */}
                  {listing.space && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <MapPin className="w-4 h-4" />
                      <div>
                        <span className="font-semibold">Space #{listing.space.spaceNumber}</span>
                        {listing.space.location && ` - ${listing.space.location}`}
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  {(listing.availableFrom || listing.availableTo) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {listing.type === "short-term" ? (
                          <>
                            {listing.availableFrom && formatDateTime(listing.availableFrom)}
                            {listing.availableTo && ` - ${formatDateTime(listing.availableTo)}`}
                          </>
                        ) : (
                          <>{t("availableFromDate")} {listing.availableFrom && formatDate(listing.availableFrom)}</>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {listing.description && (
                    <p className="text-sm text-gray-700">{listing.description}</p>
                  )}

                  {/* Book Button for Short-term */}
                  {listing.type === "short-term" && listing.poster?.userId !== userId && (
                    <div className="pt-3 border-t">
                      <Button
                        className="w-full"
                        onClick={() => handleBookSpace(listing)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        {t("bookSpace")}
                      </Button>
                    </div>
                  )}

                  {/* Contact Info */}
                  {listing.poster && (
                    <div className="pt-3 border-t space-y-2">
                      <div className="text-sm font-semibold text-gray-900">
                        {t("postedBy")}: {listing.poster.name}
                      </div>
                      <div className="flex gap-2">
                        {listing.poster.telegramUsername && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => openTelegram(listing.poster.telegramUsername)}
                            onPointerDown={(e) => e.preventDefault()}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {t("telegram")}
                          </Button>
                        )}
                        {listing.poster.phoneNumber && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => window.open(`tel:${listing.poster.phoneNumber}`, "_blank", "noopener,noreferrer")}
                            onPointerDown={(e) => e.preventDefault()}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            {t("call")}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Owner Contact from Space */}
                  {listing.space && (listing.space.ownerTelegram || listing.space.ownerPhone) && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-gray-500 mb-2">{t("spaceOwner")}:</div>
                      <div className="flex gap-2">
                        {listing.space.ownerTelegram && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1"
                            onClick={() => openTelegram(listing.space.ownerTelegram)}
                            onPointerDown={(e) => e.preventDefault()}
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {listing.space.ownerTelegram}
                          </Button>
                        )}
                        {listing.space.ownerPhone && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1"
                            onClick={() => window.open(`tel:${listing.space.ownerPhone}`, "_blank", "noopener,noreferrer")}
                            onPointerDown={(e) => e.preventDefault()}
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            {t("call")}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Booking Dialog */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("bookingSpace")}</DialogTitle>
            </DialogHeader>
            {selectedListing && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-900">{selectedListing.title}</div>
                  {selectedListing.space && (
                    <div className="text-sm text-gray-600 mt-1">
                      {t("spaceNumber")}: #{selectedListing.space.spaceNumber}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="parkingFrom">{t("parkingFrom")}</Label>
                    <Input
                      id="parkingFrom"
                      type="datetime-local"
                      value={bookingData.parkingFrom}
                      onChange={(e) => setBookingData({ ...bookingData, parkingFrom: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parkingTo">{t("parkingTo")}</Label>
                    <Input
                      id="parkingTo"
                      type="datetime-local"
                      value={bookingData.parkingTo}
                      onChange={(e) => setBookingData({ ...bookingData, parkingTo: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowBookingDialog(false)}
                    disabled={booking}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={confirmBooking}
                    disabled={booking}
                  >
                    {booking ? t("loading") : t("confirmBooking")}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}