import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { hapticFeedback } from "@/app/components/TelegramWebApp";

interface CreateRequestProps {
  userId: string;
  onBack: () => void;
  apiUrl: string;
  apiKey: string;
}

export default function CreateRequest({ userId, onBack, apiUrl, apiKey }: CreateRequestProps) {
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    budget: "",
    requestedFrom: "",
    requestedTo: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/requests`, {
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
        toast.success("Request posted successfully!");
        onBack();
      } else {
        hapticFeedback("error");
        toast.error("Failed to post request. Please try again.");
      }
    } catch (error) {
      console.error("Error creating request:", error);
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
          <h1 className="text-2xl font-bold text-gray-900">Post Request</h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="type">Request Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="What are you looking for?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Looking to Buy</SelectItem>
                  <SelectItem value="rent-long">Looking for Long-term Rental</SelectItem>
                  <SelectItem value="short-term">Need Short-term Parking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Looking for covered parking near Building A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="e.g., Up to $200/month"
              />
            </div>

            {formData.type === "short-term" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="requestedFrom">Needed From</Label>
                  <Input
                    id="requestedFrom"
                    type="datetime-local"
                    value={formData.requestedFrom}
                    onChange={(e) => setFormData({ ...formData, requestedFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestedTo">Needed Until</Label>
                  <Input
                    id="requestedTo"
                    type="datetime-local"
                    value={formData.requestedTo}
                    onChange={(e) => setFormData({ ...formData, requestedTo: e.target.value })}
                  />
                </div>
              </div>
            )}

            {formData.type === "rent-long" && (
              <div className="space-y-2">
                <Label htmlFor="requestedFrom">Needed From</Label>
                <Input
                  id="requestedFrom"
                  type="date"
                  value={formData.requestedFrom}
                  onChange={(e) => setFormData({ ...formData, requestedFrom: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide details about what you're looking for..."
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !formData.type || !formData.title}>
              {loading ? "Posting..." : "Post Request"}
            </Button>
          </form>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-200 mt-4">
          <p className="text-sm text-blue-900">
            💡 Your contact info from your profile will be visible to others so they can reach out to you.
          </p>
        </Card>
      </div>
    </div>
  );
}