#!/bin/bash

# Скрипт для сборки Docker образа с переменными окружения Supabase
# Использование: ./docker-build.sh

set -e

echo "🐳 Сборка Docker образа для Parking Assistant Mini App"
echo "=================================================="

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo "❌ Ошибка: Файл .env не найден!"
    echo "📝 Создайте файл .env на основе .env.example:"
    echo "   cp .env.example .env"
    echo "   Затем заполните его правильными значениями из Supabase Dashboard"
    exit 1
fi

# Загрузка переменных окружения
echo "📦 Загрузка переменных окружения из .env..."
source .env

# Проверка обязательных переменных
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ Ошибка: VITE_SUPABASE_URL не установлен в .env"
    exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Ошибка: VITE_SUPABASE_ANON_KEY не установлен в .env"
    exit 1
fi

echo "✅ Переменные окружения загружены"
echo "   URL: $VITE_SUPABASE_URL"
echo "   Key: ${VITE_SUPABASE_ANON_KEY:0:20}..."

# Создание временного файла с ключом для Docker secret
echo "$VITE_SUPABASE_ANON_KEY" > /tmp/supabase_key.txt

# Сборка образа
echo ""
echo "🔨 Начинаем сборку Docker образа..."
docker build \
  --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  --secret id=supabase_key,src=/tmp/supabase_key.txt \
  -t parking-assistant:latest \
  .

# Удаление временного файла
rm -f /tmp/supabase_key.txt

echo ""
echo "✅ Образ успешно собран!"
echo ""
echo "🚀 Для запуска контейнера используйте:"
echo "   docker run -d -p 8080:80 --name parking-assistant parking-assistant:latest"
echo ""
echo "🌐 Приложение будет доступно по адресу: http://localhost:8080"
