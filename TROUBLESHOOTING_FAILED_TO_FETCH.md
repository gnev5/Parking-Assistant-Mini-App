# 🔴 Устранение ошибки "Failed to fetch"

## Что означает эта ошибка?

Ошибка "Failed to fetch" означает, ч��о браузер **вообще не может** подключиться к серверу. Это происходит ДО получения ответа от сервера.

## 🔍 Пошаговая диагностика

### Шаг 1: Проверьте URL проекта

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. **Settings** → **API**
4. Скопируйте **Project URL**

**Правильный формат:**
```
https://ваш-проект-id.supabase.co
```

**НЕ должно быть:**
- ❌ `https://supabase.com`
- ❌ `https://app.supabase.com`
- ❌ URL с завершающим слэшем `/`

### Шаг 2: Проверьте статус Edge Function

**Критически важно!** Edge Function может быть не развернута.

1. **Supabase Dashboard** → **Edge Functions** (слева в меню)
2. Найдите функцию **`make-server-48e86749`**
3. Проверьте статус:
   - ✅ **Active** (зеленый) - функция работает
   - ❌ **Inactive** / отсутствует - функция не развернута

### Шаг 3: Разверните Edge Function (если нужно)

Если функция отсутствует или неактивна:

#### Вариант A: Через Supabase CLI (рекомендуется)

```bash
# Установите Supabase CLI (если еще не установлен)
npm install -g supabase

# Авторизуйтесь
supabase login

# Перейдите в директорию проекта
cd "c:/web/Parking Assistant Mini App"

# Разверните функцию
supabase functions deploy make-server-48e86749
```

#### Вариант B: Через Dashboard (вручную)

1. В **Edge Functions** нажмите **"Deploy new function"**
2. Название: `make-server-48e86749`
3. Скопируйте код из `supabase/functions/server/index.tsx`
4. Нажмите **Deploy**

### Шаг 4: Проверьте CORS в функции

Откройте `supabase/functions/server/index.tsx` и убедитесь, что есть:

```typescript
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);
```

### Шаг 5: Проверьте переменные окружения функции

Edge Function требует переменные окружения:

1. **Supabase Dashboard** → **Edge Functions**
2. Нажмите на функцию `make-server-48e86749`
3. **Settings** → **Environment Variables**
4. Убед��тесь, что установлены:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

Если их нет, добавьте:
- `SUPABASE_URL` = ваш Project URL
- `SUPABASE_SERVICE_ROLE_KEY` = Service Role Key из Settings → API

### Шаг 6: Тест из браузера

Откройте консоль браузера (F12) и выполните:

```javascript
// Замените на ваш реальный URL и ключ
const url = 'https://ваш-проект.supabase.co/functions/v1/make-server-48e86749/health';
const key = 'ваш-anon-key';

fetch(url, {
  headers: {
    'apikey': key
  }
})
.then(r => r.json())
.then(d => console.log('✅ Успех:', d))
.catch(e => console.error('❌ Ошибка:', e));
```

## 🐛 Типичные проблемы

### Проблема 1: Функция не развернута

**Симптомы:**
- "Failed to fetch"
- В Dashboard нет функции `make-server-48e86749`

**Решение:**
```bash
cd "c:/web/Parking Assistant Mini App"
supabase functions deploy make-server-48e86749
```

### Проблема 2: Неправильный URL

**Симптомы:**
- "Failed to fetch"
- URL выглядит как `undefined/functions/...`

**Решение:**
1. Проверьте файл `.env`
2. Убедитесь, что `VITE_SUPABASE_URL` установлен
3. Перезапустите dev сервер или пересоберите Docker

### Проблема 3: CORS блокируется

**Симптомы:**
- "CORS policy" в консоли браузера
- "Failed to fetch"

**Решение:**
1. Добавьте CORS middleware в `supabase/functions/server/index.tsx`
2. Передеплойте функцию: `supabase functions deploy make-server-48e86749`

### Проблема 4: Фай��вол или VPN

**Симптомы:**
- "Failed to fetch" только на вашем компьютере
- На других компьютерах работает

**Решение:**
- Отключите VPN
- Проверьте настройки файрвола
- Попробуйте другую сеть

## ✅ Чек-лист проверки

Перед повторным те��том убедитесь:

- [ ] URL корректный (без `/` в конце)
- [ ] Anon Key корректный (начинается с `eyJ...`)
- [ ] Edge Function развернута и активна
- [ ] Переменные окружения установлены в функции
- [ ] CORS настроен в коде функции
- [ ] Таблица `kv_store_48e86749` существует в Database
- [ ] Интернет подключение работает

## 🧪 Тест готовности

Выполните команду в терминале:

```bash
# Замените URL и KEY на ваши
curl -H "apikey: ваш-anon-key" https://ваш-проект.supabase.co/functions/v1/make-server-48e86749/health
```

**Ожидаемый ответ:**
```json
{"status":"ok"}
```

## 📞 Если ничего не помогает

1. **Проверьте логи функции:**
   - Dashboard → Edge Functions → `make-server-48e86749` → Logs

2. **Создайте минимальную тестовую функцию:**
   ```bash
   supabase functions new test-function
   ```
   
   В `supabase/functions/test-function/index.ts`:
   ```typescript
   Deno.serve(() => new Response('Hello World'));
   ```
   
   Разверните:
   ```bash
   supabase functions deploy test-function
   ```
   
   Протестируйте:
   ```
   https://ваш-проект.supabase.co/functions/v1/test-function
   ```

3. **Обратитесь в support Supabase:**
   - [https://supabase.com/support](https://supabase.com/support)
   - Приложите логи функции
   - Укажите версию Supabase CLI: `supabase --version`

---

**Дата:** 2026-02-08  
**Версия:** 1.0
