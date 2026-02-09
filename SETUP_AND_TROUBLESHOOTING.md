# 🚀 Настройка и устранение проблем Parking Assistant Mini App

## 📊 Краткое описание проблемы

**Проблема:** Кнопка "Сохранить профиль" не работает в приложении.

**Причина:** Некорректная конфигурация подключения к Supabase и отсутствие обработки ошибок.

**Решение:** Выполнить настройку переменных окружения и применить исправления кода.

---

## ✅ Быстрый старт (Quick Start)

### 1. Настройка переменных окружения

```bash
# Создайте файл .env на основе примера
cp .env.example .env
```

Откройте `.env` и заполните данные из [Supabase Dashboard](https://supabase.com/dashboard):

```env
VITE_SUPABASE_URL=https://ваш-проект-id.supabase.co
VITE_SUPABASE_ANON_KEY=ваш-anon-key
```

**Где взять эти данные:**
1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. **Settings** → **API**
4. Скопируйте:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### 2. Проверка API эндпоинтов

Откройте файл [`test-api.html`](test-api.html) в браузере:

```bash
# Просто откройте файл в браузере или используйте локальный сервер
# Windows: двойной клик по файлу
# Linux/Mac: open test-api.html
```

1. Вставьте URL и ключ из `.env`
2. Нажмите **"🚀 Запустить полную диагностику"**
3. Все тесты должны пройти успешно ✅

### 3. Запуск в режиме разработки

```bash
# Установите зависимости (если еще не установлены)
npm install

# Запустите dev сервер
npm run dev
```

Откройте http://localhost:5173 и проверьте:
- ✅ В консоли браузера (F12) должно быть: "✅ Supabase configuration loaded"
- ✅ При сохранении профиля появляется уведомление
- ✅ Пос��е сохранения данные видны в Supabase Dashboard → Table Editor → `kv_store_48e86749`

### 4. Сборка и запуск Docker контейнера

**Windows:**
```cmd
docker-build.bat
```

**Linux/Mac:**
```bash
chmod +x docker-build.sh
./docker-build.sh
```

**Запуск:**
```bash
docker run -d -p 8080:80 --name parking-assistant parking-assistant:latest
```

Откройте http://localhost:8080

---

## 🔍 Детальная диагностика

### Шаг 1: Проверка переменных окружения

**В терминале:**
```bash
# Linux/Mac
cat .env

# Windows
type .env
```

**Ожидаемый результат:**
```
VITE_SUPABASE_URL=https://cerplyttnwbcgtcvsbbd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Шаг 2: Проверка базы данных Supabase

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. **Table Editor** → найдите таблицу `kv_store_48e86749`
3. Если таблицы нет, создайте её:

```sql
CREATE TABLE kv_store_48e86749 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

### Шаг 3: Проверка деплоя Edge Function

1. **Supabase Dashboard** → **Edge Functions**
2. Найдите функцию `make-server-48e86749`
3. Проверьте статус: должен быть **Active** 🟢

**Если функции нет:**
```bash
# Установите Supabase CLI
npm install -g supabase

# Логин
supabase login

# Деплой функции
supabase functions deploy make-server-48e86749
```

### Шаг 4: Проверка кода

Убедитесь, что в [`src/app/App.tsx`](src/app/App.tsx) применены исправления:

**Проверьте наличие:**
1. ✅ Import: `import { Toaster, toast } from "@/app/components/ui/sonner";`
2. ✅ Валидация в useEffect с выводом в консоль
3. ✅ Улучшенная функция `handleSaveProfile` с обработкой ошибок
4. ✅ Toast уведомления при успехе/ошибке

---

## 🐛 Типичные проблемы и решения

### Проблема 1: "Supabase configuration is missing"

**Симптом:** При запуске в консоли браузера ошибка о конфигурации.

**Решение:**
1. Проверьте наличие файла `.env` в корне проекта
2. Убедитесь, что переменные начинаются с `VITE_`
3. Перезапустите dev сервер (`npm run dev`)
4. Для Docker: пересоберите образ

### Проблема 2: Запросы идут на "undefined/functions/..."

**Причина:** Переменные окружения не загружены.

**Решение для dev режима:**
```bash
# Остановите сервер (Ctrl+C)
# Проверьте .env
cat .env

# Перезапустите
npm run dev
```

**Решение для Docker:**
```bash
# Пересоберите образ с переменными
./docker-build.sh  # или docker-build.bat на Windows

# Остановите старый контейнер
docker stop parking-assistant
docker rm parking-assistant

# Запустите новый
docker run -d -p 8080:80 --name parking-assistant parking-assistant:latest
```

### Проблема 3: CORS ошибки

**Симптом:** В ко��соли браузера `Access-Control-Allow-Origin` ошибка.

**Решение:** Проверьте `supabase/functions/server/index.tsx`:
```typescript
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "apikey"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
```

Если нужно изменить, передеплойте функцию:
```bash
supabase functions deploy make-server-48e86749
```

### Проблема 4: 404 Not Found при запросах к API

**Возможные причины:**
1. Edge Function не развернута
2. Неправильное имя функции
3. Неправильный URL

**Решение:**
1. Проверьте URL в test-api.html
2. Должен быть: `https://your-project.supabase.co/functions/v1/make-server-48e86749`
3. П��оверьте деплой в Dashboard → Edge Functions

### Проблема 5: Данные не сохраняются

**Диагностика:**
1. Откройте DevTools (F12) → Network
2. Нажмите "Сохранить профиль"
3. Найдите запрос к `/users`
4. ��роверьте:
   - **Status Code:** должен быть 200
   - **Response:** должен содержать `{"success": true, "user": {...}}`

**Если 500 Internal Server Error:**
1. Проверьте логи функции в Supabase Dashboard
2. Убедитесь, что таблица `kv_store_48e86749` существует
3. Проверьте права доступа к таблице

---

## 📋 Чеклист готовности

Перед тем, как считать проблему решенной, проверьте:

### Backend (Supabase)
- [ ] Таблица `kv_store_48e86749` существует
- [ ] Edge Function `make-server-48e86749` развернута и активна
- [ ] CORS настроен правильно
- [ ] API ключи валидны

### Frontend (Приложение)
- [ ] Файл `.env` создан и заполнен
- [ ] Переменные `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` установлены
- [ ] Исправления в `App.tsx` применены
- [ ] Import для toast добавлен
- [ ] В консоли браузера видно "✅ Supabase configuration loaded"

### Функциональность
- [ ] Health check проходит успешно (test-api.html)
- [ ] Создание пользователя работает (test-api.html)
- [ ] Получение пользователя работает (test-api.html)
- [ ] При сохранении профиля появляется toast уведомление
- [ ] Данные сохраняются в Supabase (видны в Table Editor)
- [ ] После сохранения происходит редирект на главную страницу

---

## 📚 Дополнительные ресурсы

### Созданные файлы для диагностики

1. **[test-api.html](test-api.html)** - Интерактивный инструмент для тестирования API
2. **[API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)** - Подробное руководство по тестированию
3. **[DIAGNOSTICS_AND_FIXES.md](DIAGNOSTICS_AND_FIXES.md)** - Детальная диагностика и исправления
4. **[.env.example](.env.example)** - Пример конфигурации
5. **[docker-build.sh](docker-build.sh)** / **[docker-build.bat](docker-build.bat)** - Скрипты для сборки

### Полезные команды

```bash
# Проверка статуса Docker контейнера
docker ps -a | grep parking-assistant

# Просмотр логов контейнера
docker logs parking-assistant

# Остановка и удаление контейнера
docker stop parking-assistant && docker rm parking-assistant

# Проверка образа
docker images | grep parking-assistant

# Удаление образа
docker rmi parking-assistant:latest

# Запуск Supabase локально (опционально)
supabase start
```

### Структура API

**Endpoint:** `/make-server-48e86749/users`

**POST - Создание/обновление пользователя:**
```json
Request:
{
  "userId": "string",
  "name": "string",
  "telegramUsername": "string",
  "phoneNumber": "string",
  "isOwner": boolean,
  "language": "ru" | "en"
}

Response (200):
{
  "success": true,
  "user": {
    "userId": "...",
    "name": "...",
    "telegramUsername": "...",
    "phoneNumber": "...",
    "isOwner": false,
    "language": "ru",
    "createdAt": "2026-02-08T..."
  }
}

Response (400):
{
  "error": "userId and name are required"
}
```

**GET `/users/:id` - Получение пользователя:**
```json
Response (200):
{
  "user": { ... }
}

Response (404):
{
  "error": "User not found"
}
```

---

## 🎯 Следующие шаги после устранения проблемы

1. **Тестирование других функций:**
   - Создание парковочных мест
   - Создание объявлений
   - Создание запросов
   - Бронирование

2. **Оптимизация:**
   - Добавить rate limiting
   - Добавить кэширование
   - Оптимизировать запросы к БД

3. **Безопасность:**
   - Настроить Row Level Security (RLS) в Supabase
   - Добавить валидацию данных на сервере
   - Защитить от SQL injection (уже защищено через KV store)

4. **Мониторинг:**
   - Настроить логирование ошибок
   - Добавить метрики производительности
   - Настроить алерты в Supabase

---

## 🆘 Получение помощи

Если проблема не решена:

1. **Проверьте логи:**
   - Консоль браузера (F12 → Console)
   - Network tab (F12 → Network)
   - Docker logs (`docker logs parking-assistant`)
   - Supabase Function logs (Dashboard → Edge Functions → Logs)

2. **Соберите информацию:**
   - Версия Node.js: `node --version`
   - Версия npm: `npm --version`
   - Версия Docker: `docker --version`
   - Операционная система
   - Скриншот ошибки из консоли

3. **Создайте issue** с собранной информацией

---

**Автор:** Roo  
**Дата:** 2026-02-08  
**Версия:** 1.0  
**Статус:** ✅ Готово к использованию
