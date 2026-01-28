import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ArrowLeft, DollarSign, Calendar, MessageCircle, Phone, Trash2, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { openTelegramUser, hapticFeedback } from "@/app/components/TelegramWebApp";
import { toast } from "sonner";
import { useTranslation } from "@/app/i18n/useTranslation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";

interface BrowseRequestsProps {
  userId: string;
  userLanguage: string;
  onBack: () => void;
  apiUrl: string;
  apiKey: string;
}

export default function BrowseRequests({ userId, userLanguage, onBack, apiUrl, apiKey }: BrowseRequestsProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [mySpaces, setMySpaces] = useState<any[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState("");
  const [offering, setOffering] = useState(false);
  const { t } = useTranslation(userLanguage as "en" | "ru");

  useEffect(() => {
    fetchRequests(filter === "all" ? undefined : filter);
    fetchMySpaces();
  }, [filter]);

  const fetchMySpaces = async () => {
    try {
      const response = await fetch(`${apiUrl}/spaces/owner/${userId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await response.json();
      setMySpaces(data.spaces || []);
    } catch (error) {
      console.error("Error fetching my spaces:", error);
    }
  };

  const fetchRequests = async (type?: string) => {
    setLoading(true);
    try {
      const url = type ? `${apiUrl}/requests?type=${type}` : `${apiUrl}/requests`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "buy": return t("looking_to_buy");
      case "rent-long": return t("looking_for_rental");
      case "short-term": return t("need_guest_parking");
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "buy": return "bg-emerald-100 text-emerald-800";
      case "rent-long": return "bg-indigo-100 text-indigo-800";
      case "short-term": return "bg-amber-100 text-amber-800";
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

  const openTelegram = (username: string) => {
    hapticFeedback("light");
    openTelegramUser(username);
  };

  const deleteRequest = async (requestId: string) => {
    // Ask for confirmation
    if (!confirm(t("are_you_sure_delete_request"))) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/requests/${requestId}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}` 
        },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        hapticFeedback("success");
        setRequests(requests.filter((req) => req.requestId !== requestId));
        toast.success(t("request_deleted_successfully"));
      } else {
        hapticFeedback("error");
        const errorData = await response.json();
        toast.error(errorData.error || t("failed_delete_request"));
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      hapticFeedback("error");
      toast.error(t("failed_delete_request"));
    }
  };

  const handleOfferSpace = (request: any) => {
    setSelectedRequest(request);
    setSelectedSpaceId("");
    setShowOfferDialog(true);
  };

  const confirmOffer = async () => {
    if (!selectedSpaceId) {
      toast.error(t("selectSpaceToOffer"));
      return;
    }

    setOffering(true);
    try {
      const response = await fetch(`${apiUrl}/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          requestId: selectedRequest.requestId,
          userId,
          spaceId: selectedSpaceId,
        }),
      });

      if (response.ok) {
        hapticFeedback("success");
        toast.success(t("offerSuccess"));
        setShowOfferDialog(false);
        setSelectedSpaceId("");
      } else {
        hapticFeedback("error");
        const errorData = await response.json();
        toast.error(errorData.error || t("offerFailed"));
      }
    } catch (error) {
      console.error("Error offering space:", error);
      hapticFeedback("error");
      toast.error(t("offerFailed"));
    } finally {
      setOffering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{t("browseRequestsTitle")}</h1>
        </div>

        <Tabs defaultValue="all" onValueChange={setFilter} className="mb-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">{t("all")}</TabsTrigger>
            <TabsTrigger value="buy">{t("buy")}</TabsTrigger>
            <TabsTrigger value="rent-long">{t("rental")}</TabsTrigger>
            <TabsTrigger value="short-term">{t("guest")}</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-12 text-gray-500">{t("loading")}</div>
        ) : requests.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">{t("noRequestsFound")}</h3>
            <p className="text-gray-600">{t("checkBackLater")}</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.requestId} className="p-4 hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{request.title}</h3>
                      <Badge className={`mt-1 ${getTypeBadgeColor(request.type)}`}>
                        {getTypeLabel(request.type)}
                      </Badge>
                    </div>
                    {request.budget && (
                      <div className="text-right">
                        <div className="font-semibold text-gray-700">{request.budget}</div>
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  {(request.requestedFrom || request.requestedTo) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {request.type === "short-term" ? (
                          <>
                            {request.requestedFrom && formatDateTime(request.requestedFrom)}
                            {request.requestedTo && ` - ${formatDateTime(request.requestedTo)}`}
                          </>
                        ) : (
                          <>{t("neededFromDate")} {request.requestedFrom && formatDate(request.requestedFrom)}</>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {request.description && (
                    <p className="text-sm text-gray-700">{request.description}</p>
                  )}

                  {/* Offer Button for Short-term Requests */}
                  {request.type === "short-term" && request.poster?.userId !== userId && mySpaces.length > 0 && (
                    <div className="pt-3 border-t">
                      <Button
                        className="w-full"
                        onClick={() => handleOfferSpace(request)}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        {t("offerSpace")}
                      </Button>
                    </div>
                  )}

                  {/* Contact Info and Actions */}
                  {request.poster && (
                    <div className="pt-3 border-t space-y-2">
                      <div className="text-sm font-semibold text-gray-900">
                        {request.poster.userId === userId ? t("yourRequest") : `${t("requestedBy")}: ${request.poster.name}`}
                      </div>
                      
                      {request.poster.userId === userId ? (
                        // Show delete button for own requests
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full"
                          onClick={() => deleteRequest(request.requestId)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {t("deleteRequest")}
                        </Button>
                      ) : (
                        // Show contact buttons for others' requests
                        <div className="flex gap-2">
                          {request.poster.telegramUsername && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => openTelegram(request.poster.telegramUsername)}
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {t("telegram")}
                            </Button>
                          )}
                          {request.poster.phoneNumber && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => window.open(`tel:${request.poster.phoneNumber}`)}
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              {t("call")}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Offer Space Dialog */}
        <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("offeringSpace")}</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-900">{selectedRequest.title}</div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {selectedRequest.requestedFrom && formatDateTime(selectedRequest.requestedFrom)}
                      {selectedRequest.requestedTo && ` - ${formatDateTime(selectedRequest.requestedTo)}`}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spaceSelect">{t("selectYourSpace")}</Label>
                  <Select value={selectedSpaceId} onValueChange={setSelectedSpaceId}>
                    <SelectTrigger id="spaceSelect">
                      <SelectValue placeholder={t("selectSpaceToOffer")} />
                    </SelectTrigger>
                    <SelectContent>
                      {mySpaces.map((space) => (
                        <SelectItem key={space.spaceId} value={space.spaceId}>
                          {t("spaceNumber")} #{space.spaceNumber}
                          {space.location && ` - ${space.location}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowOfferDialog(false)}
                    disabled={offering}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={confirmOffer}
                    disabled={offering}
                  >
                    {offering ? t("loading") : t("confirmOffer")}
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