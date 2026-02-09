# 🔍 Диагностика и исправления проблем

## ⚠️ Обнаруженные проблемы

### Проблема 1: Отсутствие обработки ошибок при сохранении профиля

**Местоположение:** `src/app/App.tsx`, функция `handleSaveProfile` (строки 71-92)

**Текущий код:**
```typescript
const handleSaveProfile = async (profileData: any) => {
  try {
    const response = await fetch(`${API_URL}/users?apikey=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        ...profileData,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setUserProfile(data.user);
      setCurrentView("home");
    }
  } catch (error) {
    console.error("Error saving profile:", error);
  }
};
```

**Проблемы:**
1. ❌ Нет уведомления пользователя об ошибке
2. ❌ При ошибке сервера (response.ok === false) ничего не происходит
3. ❌ Пользователь не понимает, что произошло
4. ❌ Нет проверки на undefined переменных API_URL и API_KEY

### Проблема 2: Отсутствие валидации переменных окружения

**Местоположение:** `src/app/App.tsx`, строки 10-11

**Текущий код:**
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

**Проблема:**
- ❌ Если переменные не установлены, приложение будет работать с `undefined`
- ❌ API запросы будут отправляться на `undefined/functions/v1/make-server-48e86749`

### Проблема 3: Нет индикации загрузки при сохранении

**Проблема:**
- ❌ Компонент `ProfileSetup` имеет локальный state `loading`, но пользователь не видит индикатор при сохранении
- ❌ Кнопка не блокируется во время сохранения

## 🛠️ Рекомендуемые исправления

### Исправление 1: Улучшенная обработка ошибок с уведомлениями

**Обновленный код для `handleSaveProfile`:**

```typescript
const handleSaveProfile = async (profileData: any) => {
  try {
    // Проверка переменных окружения
    if (!API_URL || !API_KEY) {
      toast.error("Ошибка конфигурации: переменные Supabase не установлены");
      console.error("Missing Supabase configuration:", { API_URL, API_KEY });
      return;
    }

    const response = await fetch(`${API_URL}/users?apikey=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
      // Обработка ошибок сервера
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      toast.error(`Ошибка сохранения профиля: ${errorData.error || response.statusText}`);
      console.error("Server error:", response.status, errorData);
    }
  } catch (error) {
    // Обработка сетевых ошибок
    toast.error("Ошибка сети. Проверьте подключение к интернету.");
    console.error("Network error saving profile:", error);
  }
};
```

**Что нужно добавить:**
```typescript
import { toast } from "sonner";
```

### Исправление 2: Валидация переменных окружения при старте

**Добавить в начало компонента App:**

```typescript
export default function App() {
  // Проверка переменных окружения
  useEffect(() => {
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
  }, []);

  // ... остальной код
}
```

### Исправление 3: Улучшение компонента ProfileSetup

**Изменения не требуются в ProfileSetup.tsx**, так как он уже:
- ✅ Управляет состоянием `loading`
- ✅ Блокирует кнопку при отправке
- ✅ Показывает текст "Loading..." на кнопке

Проблема в том, что родительский компонент не дожидается завершения и не возвращает статус.

### Исправление 4: Добавление индикации статуса API

**Создать новый компонент для отладки (опционально):**

```typescript
// src/app/components/ApiStatusIndicator.tsx
import { useEffect, useState } from "react";

interface ApiStatusProps {
  apiUrl: string;
  apiKey: string;
}

export function ApiStatusIndicator({ apiUrl, apiKey }: ApiStatusProps) {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${apiUrl}/health?apikey=${apiKey}`);
        setStatus(response.ok ? "online" : "offline");
      } catch {
        setStatus("offline");
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Проверка каждые 30 сек

    return () => clearInterval(interval);
  }, [apiUrl, apiKey]);

  if (status === "checking") return null;

  return (
    <div className={`fixed top-4 right-4 px-3 py-2 rounded-full text-sm ${
      status === "online" 
        ? "bg-green-100 text-green-800" 
        : "bg-red-100 text-red-800"
    }`}>
      {status === "online" ? "● API Online" : "● API Offline"}
    </div>
  );
}
```

## 📋 Чек-лист для диагностики

### 1. Проверка переменных окружения

```bash
# В консоли браузера (F12 → Console):
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**Ожидаемый результат:**
```
VITE_SUPABASE_URL: https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Если видите `undefined`:**
1. Проверьте наличие файла `.env` в корне проекта
2. Проверьте правильность названий переменных (должны начинаться с `VITE_`)
3. Перезапустите dev-сервер или пересоберите Docker образ

### 2. Проверка URL API запроса

```bash
# В консоли браузера:
const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-48e86749`;
console.log('API_URL:', API_URL);
```

**Ожидаемый результат:**
```
API_URL: https://your-project.supabase.co/functions/v1/make-server-48e86749
```

### 3. Проверка Network запросов

1. Откройте DevTools (F12) → Network
2 попробуйте сохранить профиль
3. Найдите запрос к `/users`
4. Проверьте:
   - ✅ Request URL должен быть правильным
   - ✅ Request Method: POST
   - ✅ Status: 200 OK (если успешно)
   - ✅ Request Headers должны содержать `Content-Type: application/json`
   - ✅ Query Parameters должны содержать `apikey`
   - ✅ Request Payload должен содержать userId, name и т.д.

### 4. Проверка данных в Supabase

1. Откройте Supabase Dashboard
2. Table Editor → `kv_store_48e86749`
3. Проверьте наличие записи с ключом `user:{userId}`

## 🚀 Порядок действий для исправления

### Шаг 1: Подготовка окружения
```bash
# 1. Создайте .env файл
cp .env.example .env

# 2. Откройте .env и заполните данные из Supabase Dashboard
# Settings → API → Project URL и Anon key

# 3. Проверьте содержимое
cat .env  # Linux/Mac
type .env  # Windows
```

### Шаг 2: Обновление кода App.tsx
1. Добавьте import для toast
2. Обновите функцию handleSaveProfile
3. Добавьте валидацию переменных окружения

### Шаг 3: Тестирование в dev режиме
```bash
# Запустите dev сервер
npm run dev

# Откройте http://localhost:5173
# Проверьте консоль на наличие сообщений о конфигурации
```

### Шаг 4: Тестирование API
1. Откройте `test-api.html` в браузере
2. Введите URL и ключ из .env
3. Выполните "Запустить полную диагностику"
4. Все тесты должны пройти успешно ✅

### Шаг 5: Тестирование в приложении
1. Перейдите в профиль
2. Заполните данные
3. Нажмите "Сохранить профиль"
4. Проверьте:
   - ✅ Появилось ли уведомление об успехе
   - ✅ Перенаправило ли на главную страницу
   - ✅ Сохранились ли данные в Supabase

### Шаг 6: Пересборка Docker образа
```bash
# Linux/Mac
chmod +x docker-build.sh
./docker-build.sh

# Windows
docker-build.bat

# Запуск контейнера
docker run -d -p 8080:80 --name parking-assistant parking-assistant:latest

# Проверка
curl http://localhost:8080
```

## 🐛 Типичные ошибки и решения

### Ошибка: "CORS policy"
**Решение:** Убедитесь, что в `supabase/functions/server/index.tsx` настроен CORS:
```typescript
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "apikey"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
```

### Ошибка: "Failed to fetch"
**Возможные причины:**
1. Неправильный URL
2. Edge Function не развернута
3. Проблемы с сетью

**Решение:** Проверьте URL и статус функции в Supabase Dashboard

### Ошибка: "User not found" (404)
**Причина:** Пользователь еще не создан

**Решение:** Сначала создайте пользователя через POST `/users`, затем получайте через GET

### Данные не сохраняются при перезапуске
**Причина:** Используется KV store в памяти вместо базы данных

**Проверка:** Убедитесь, что таблица `kv_store_48e86749` существует в Supabase

## 📊 Ожидаемое поведение после исправлений

1. ✅ При загрузке приложения видно сообщение о статусе конфигурации
2. ✅ При нажатии "Сохранить профиль" появляется индикатор загрузки
3. ✅ При успехе - зеленое уведомление "Профиль сохранен"
4. ✅ При ошибке - красное уведомление с описанием
5. ✅ Данные сохраняются в Supabase и видны в Table Editor
6. ✅ При повторном входе профиль загружается автоматически

---

**Дата создания:** 2026-02-08  
**Версия:** 1.0
