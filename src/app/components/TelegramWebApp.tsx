// Telegram WebApp Integration Helper
// This component provides utilities for integrating with Telegram Mini Apps

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    receiver?: TelegramUser;
    chat?: any;
    chat_type?: string;
    chat_instance?: string;
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: any;
  MainButton: any;
  HapticFeedback: any;
  close: () => void;
  ready: () => void;
  expand: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  sendData: (data: string) => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const getTelegramWebApp = (): TelegramWebApp | null => {
  return window.Telegram?.WebApp || null;
};

export const getTelegramUser = (): TelegramUser | null => {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user || null;
};

export const isTelegramWebApp = (): boolean => {
  return !!window.Telegram?.WebApp;
};

export const initTelegramWebApp = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.ready();
    webApp.expand();
    // Set theme colors
    webApp.headerColor = "#3b82f6"; // Blue color
    webApp.backgroundColor = "#f0f9ff"; // Light blue
  }
};

export const getUserId = (): string => {
  const telegramUser = getTelegramUser();
  
  if (telegramUser) {
    // In production, use Telegram user ID
    return `tg-${telegramUser.id}`;
  }
  
  // Fallback for testing outside Telegram
  let storedUserId = localStorage.getItem("parkshare_user_id");
  if (!storedUserId) {
    storedUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("parkshare_user_id", storedUserId);
  }
  return storedUserId;
};

export const getUserDisplayName = (): string => {
  const telegramUser = getTelegramUser();
  
  if (telegramUser) {
    return `${telegramUser.first_name}${telegramUser.last_name ? " " + telegramUser.last_name : ""}`;
  }
  
  return "";
};

export const getTelegramUsername = (): string => {
  const telegramUser = getTelegramUser();
  return telegramUser?.username ? `@${telegramUser.username}` : "";
};

export const openTelegramUser = (username: string) => {
  const cleanUsername = username.startsWith("@") ? username.substring(1) : username;
  const url = `https://t.me/${cleanUsername}`;
  
  // Check if we're in Telegram WebApp
  if (window.Telegram?.WebApp) {
    try {
      // Try openTelegramLink first
      if (typeof window.Telegram.WebApp.openTelegramLink === 'function') {
        window.Telegram.WebApp.openTelegramLink(url);
        return;
      }
    } catch (e) {
      console.warn('openTelegramLink failed, trying fallback');
    }
  }
  
  // Fallback: open in new tab/window
  window.open(url, "_blank", "noopener,noreferrer");
};

export const showBackButton = (onClick: () => void) => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.BackButton) {
    webApp.BackButton.show();
    webApp.BackButton.onClick(onClick);
  }
};

export const hideBackButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.BackButton) {
    webApp.BackButton.hide();
  }
};

export const hapticFeedback = (type: "light" | "medium" | "heavy" | "success" | "warning" | "error" = "light") => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.HapticFeedback) {
    if (type === "success" || type === "warning" || type === "error") {
      webApp.HapticFeedback.notificationOccurred(type);
    } else {
      webApp.HapticFeedback.impactOccurred(type);
    }
  }
};
