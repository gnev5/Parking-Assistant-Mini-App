import { useState, useEffect } from "react";
import HomePage from "@/app/components/HomePage";
import ProfileSetup from "@/app/components/ProfileSetup";
import MySpaces from "@/app/components/MySpaces";
import CreateListing from "@/app/components/CreateListing";
import BrowseListings from "@/app/components/BrowseListings";
import CreateRequest from "@/app/components/CreateRequest";
import BrowseRequests from "@/app/components/BrowseRequests";
import Notifications from "@/app/components/Notifications";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
import {
  initTelegramWebApp,
  getUserId,
  getUserDisplayName,
  getTelegramUsername,
  isTelegramWebApp,
} from "@/app/components/TelegramWebApp";
import { Toaster } from "@/app/components/ui/sonner";
import { toast } from "sonner";

export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const API_URL = `${SUPABASE_URL}/functions/v1/make-server-48e86749`;
  const API_KEY = SUPABASE_ANON_KEY;

  useEffect(() => {
    // Validate Supabase configuration
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("❌ FATAL: Supabase configuration is missing!");
      console.error("Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file");
      toast.error("Ошибка: Не настроено подключение к Supabase", {
        duration: 10000,
      });
    } else {
      console.log("✅ Supabase configuration loaded:", {
        url: SUPABASE_URL,
        keyPreview: SUPABASE_ANON_KEY.substring(0, 20) + "..."
      });
    }

    // Initialize Telegram WebApp
    initTelegramWebApp();
    initializeUser();
  }, []);

  const initializeUser = async () => {
    // Get user ID from Telegram or fallback to localStorage
    const currentUserId = getUserId();
    setUserId(currentUserId);
    
    // Try to fetch existing user profile
    try {
      const response = await fetch(`${API_URL}/users/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
      } else {
        // User doesn't exist, pre-fill profile setup with Telegram data if available
        const displayName = getUserDisplayName();
        const telegramUsername = getTelegramUsername();
        
        if (displayName || telegramUsername) {
          setUserProfile({
            name: displayName,
            telegramUsername: telegramUsername,
            isOwner: false,
          });
        }
        
        setCurrentView("profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setCurrentView("profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (profileData: any) => {
    try {
      // Validate environment variables
      if (!API_URL || !API_KEY) {
        toast.error("Ошибка конфигурации: переменные Supabase не установлены");
        console.error("Missing Supabase configuration:", { API_URL, API_KEY });
        return;
      }

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          userId,
          ...profileData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
        toast.success("Профиль успешно сохранен!");
        setCurrentView("home");
      } else {
        // Handle server errors
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        toast.error(`Ошибка сохранения профиля: ${errorData.error || response.statusText}`);
        console.error("Server error:", response.status, errorData);
      }
    } catch (error) {
      // Handle network errors
      toast.error("Ошибка сети. Проверьте подключение к интернету.");
      console.error("Network error saving profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster position="top-center" />
      {currentView === "home" && (
        <HomePage
          userProfile={userProfile}
          onNavigate={setCurrentView}
        />
      )}
      
      {currentView === "profile" && (
        <ProfileSetup
          userProfile={userProfile}
          onSave={handleSaveProfile}
          onBack={() => setCurrentView("home")}
        />
      )}
      
      {currentView === "my-spaces" && (
        <MySpaces
          userId={userId}
          onBack={() => setCurrentView("home")}
          apiUrl={API_URL}
          apiKey={API_KEY}
        />
      )}
      
      {currentView === "create-listing" && (
        <CreateListing
          userId={userId}
          onBack={() => setCurrentView("home")}
          apiUrl={API_URL}
          apiKey={API_KEY}
        />
      )}
      
      {currentView === "browse-listings" && (
        <BrowseListings
          userId={userId}
          userLanguage={userProfile?.language || "en"}
          onBack={() => setCurrentView("home")}
          apiUrl={API_URL}
          apiKey={API_KEY}
        />
      )}
      
      {currentView === "create-request" && (
        <CreateRequest
          userId={userId}
          onBack={() => setCurrentView("home")}
          apiUrl={API_URL}
          apiKey={API_KEY}
        />
      )}
      
      {currentView === "browse-requests" && (
        <BrowseRequests
          userId={userId}
          userLanguage={userProfile?.language || "en"}
          onBack={() => setCurrentView("home")}
          apiUrl={API_URL}
          apiKey={API_KEY}
        />
      )}
      
      {currentView === "notifications" && (
        <Notifications
          userId={userId}
          userLanguage={userProfile?.language || "en"}
          onBack={() => setCurrentView("home")}
          apiUrl={API_URL}
          apiKey={API_KEY}
        />
      )}
    </div>
  );
}
