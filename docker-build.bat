@echo off
REM Скрипт для сборки Docker образа с переменными окружения Supabase (Windows)
REM Использование: docker-build.bat

echo.
echo 🐳 Сборка Docker образа для Parking Assistant Mini App
echo ==================================================
echo.

REM Проверка наличия .env файла
if not exist .env (
    echo ❌ Ошибка: Файл .env не найден!
    echo 📝 Создайте файл .env на основе .env.example:
    echo    copy .env.example .env
    echo    Затем заполните его правильными значениями из Supabase Dashboard
    exit /b 1
)

REM Загрузка переменных окружения
echo 📦 Загрузка переменных окружения из .env...
for /f "delims== tokens=1,2" %%a in (.env) do (
    if not "%%a"=="" if not "%%b"=="" (
        set %%a=%%b
    )
)

REM Проверка обязательных переменных
if "%VITE_SUPABASE_URL%"=="" (
    echo ❌ Ошибка: VITE_SUPABASE_URL не установлен в .env
    exit /b 1
)

if "%VITE_SUPABASE_ANON_KEY%"=="" (
    echo ❌ Ошибка: VITE_SUPABASE_ANON_KEY не установлен в .env
    exit /b 1
)

echo ✅ Переменные окружения загружены
echo    URL: %VITE_SUPABASE_URL%
echo    Key: %VITE_SUPABASE_ANON_KEY:~0,20%...
echo.

REM Создание временного файла с ключом для Docker secret
echo %VITE_SUPABASE_ANON_KEY% > supabase_key.txt

REM Сборка образа
echo 🔨 Начинаем сборку Docker образа...
docker build ^
  --build-arg VITE_SUPABASE_URL=%VITE_SUPABASE_URL% ^
  --secret id=supabase_key,src=supabase_key.txt ^
  -t parking-assistant:latest ^
  .

REM Удаление временного файла
del supabase_key.txt 2>nul

echo.
echo ✅ Образ успешно собран!
echo.
echo 🚀 Для запуска контейнера используйте:
echo    docker run -d -p 8080:80 --name parking-assistant parking-assistant:latest
echo.
echo 🌐 Приложение будет доступно по адресу: http://localhost:8080
echo.

pause
