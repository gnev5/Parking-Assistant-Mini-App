import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { hapticFeedback } from "@/app/components/TelegramWebApp";

interface CreateListingProps {
  userId: string;
  onBack: () => void;
  apiUrl: string;
  apiKey: string;
}

export default function CreateListing({ userId, onBack, apiUrl, apiKey }: CreateListingProps) {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: "",
    spaceId: "",
    title: "",
    price: "",
    availableFrom: "",
    availableTo: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const response = await fetch(`${apiUrl}/spaces/owner/${userId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await response.json();
      setSpaces(data.spaces || []);
    } catch (error) {
      console.error("Error fetching spaces:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          ...formData,
          postedBy: userId,
        }),
      });

      if (response.ok) {
        hapticFeedback("success");
        toast.success("Listing created successfully!");
        onBack();
      } else {
        hapticFeedback("error");
        toast.error("Failed to create listing. Please try again.");
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      hapticFeedback("error");
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Create Listing</h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="type">Listing Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select listing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent-long">Long-term Rental</SelectItem>
                  <SelectItem value="short-term">Short-term / Guest Parking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {spaces.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="space">Parking Space (Optional)</Label>
                <Select value={formData.spaceId} onValueChange={(value) => setFormData({ ...formData, spaceId: value === "none" ? "" : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a space" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {spaces.map((space) => (
                      <SelectItem key={space.spaceId} value={space.spaceId}>
                        Space #{space.spaceNumber} {space.location ? `- ${space.location}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Covered parking near entrance"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                {formData.type === "sale" ? "Price" : formData.type === "rent-long" ? "Monthly Rent" : "Hourly/Daily Rate"}
              </Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g., $100"
              />
            </div>

            {formData.type === "short-term" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="availableFrom">Available From</Label>
                  <Input
                    id="availableFrom"
                    type="datetime-local"
                    value={formData.availableFrom}
                    onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availableTo">Available To</Label>
                  <Input
                    id="availableTo"
                    type="datetime-local"
                    value={formData.availableTo}
                    onChange={(e) => setFormData({ ...formData, availableTo: e.target.value })}
                  />
                </div>
              </div>
            )}

            {formData.type === "rent-long" && (
              <div className="space-y-2">
                <Label htmlFor="availableFrom">Available From</Label>
                <Input
                  id="availableFrom"
                  type="date"
                  value={formData.availableFrom}
                  onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about the parking space..."
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !formData.type || !formData.title}>
              {loading ? "Creating..." : "Create Listing"}
            </Button>
          </form>
        </Card>

        {spaces.length === 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200 mt-4">
            <p className="text-sm text-blue-900">
              💡 Tip: Add your parking spaces first to link them to listings!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}