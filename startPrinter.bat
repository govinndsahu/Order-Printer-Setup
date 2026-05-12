@echo off
:: Start the app using the bundled Node.js runtime directly.
:: This avoids depending on shell activation or system npm/node.

set "SCRIPT_DIR=%~dp0"
:: Remove trailing backslash
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

set "RUNTIME_DIR=%SCRIPT_DIR%\runtime-environments"
set "PRINTER_PYTHON_CMD=%RUNTIME_DIR%\python\python"

cd /d "%SCRIPT_DIR%" || exit /b 1

"%RUNTIME_DIR%\nodejs\node" --watch "%SCRIPT_DIR%\app.js"