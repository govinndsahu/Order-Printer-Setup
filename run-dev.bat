@echo off
setlocal

REM Start the app using the bundled Node.js runtime directly.
set "SCRIPT_DIR=%~dp0"
set "RUNTIME_DIR=%SCRIPT_DIR%runtime-environments"
set "PRINTER_PYTHON_CMD=%RUNTIME_DIR%\python\python.exe"

"%RUNTIME_DIR%\nodejs\node.exe" --watch "%SCRIPT_DIR%app.js"
