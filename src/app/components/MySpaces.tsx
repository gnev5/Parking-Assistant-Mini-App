import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowLeft, Plus, MapPin, Edit, Phone, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { toast } from "sonner";
import { hapticFeedback } from "@/app/components/TelegramWebApp";

interface MySpacesProps {
  userId: string;
  onBack: () => void;
  apiUrl: string;
  apiKey: string;
}

export default function MySpaces({ userId, onBack, apiUrl, apiKey }: MySpacesProps) {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    spaceNumber: "",
    location: "",
    ownerName: "",
    ownerTelegram: "",
    ownerPhone: "",
  });

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
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/spaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          ownerId: userId,
          ...formData,
        }),
      });
      
      if (response.ok) {
        hapticFeedback("success");
        toast.success("Parking space added successfully!");
        setShowAddDialog(false);
        setFormData({
          spaceNumber: "",
          location: "",
          ownerName: "",
          ownerTelegram: "",
          ownerPhone: "",
        });
        fetchSpaces();
      } else {
        hapticFeedback("error");
        toast.error("Failed to add parking space.");
      }
    } catch (error) {
      console.error("Error creating space:", error);
      hapticFeedback("error");
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">My Parking Spaces</h1>
          </div>
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : spaces.length === 0 ? (
          <Card className="p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">No parking spaces yet</h3>
            <p className="text-gray-600 mb-4">Add your first parking space to get started</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Parking Space
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {spaces.map((space) => (
              <Card key={space.spaceId} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      Space #{space.spaceNumber}
                    </h3>
                    {space.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{space.location}</span>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 pt-3 border-t">
                  {space.ownerName && (
                    <div className="text-sm">
                      <span className="text-gray-600">Owner: </span>
                      <span className="text-gray-900">{space.ownerName}</span>
                    </div>
                  )}
                  {space.ownerTelegram && (
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <MessageCircle className="w-4 h-4" />
                      <span>{space.ownerTelegram}</span>
                    </div>
                  )}
                  {space.ownerPhone && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{space.ownerPhone}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Space Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Parking Space</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSpace} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spaceNumber">Space Number *</Label>
                <Input
                  id="spaceNumber"
                  value={formData.spaceNumber}
                  onChange={(e) => setFormData({ ...formData, spaceNumber: e.target.value })}
                  placeholder="A-123"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Textarea
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Building 1, Level 2, Near elevator"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerTelegram">Telegram Contact</Label>
                <Input
                  id="ownerTelegram"
                  value={formData.ownerTelegram}
                  onChange={(e) => setFormData({ ...formData, ownerTelegram: e.target.value })}
                  placeholder="@johndoe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerPhone">Phone Number</Label>
                <Input
                  id="ownerPhone"
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Space
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}