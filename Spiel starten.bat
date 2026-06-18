@echo off
setlocal
cd /d "%~dp0"
set PORT=8000

echo NOCH MAL! wird gestartet auf http://localhost:%PORT%/
echo Dieses Fenster offen lassen - Schliessen beendet den Server.

REM Browser nach kurzer Verzoegerung oeffnen
start "" cmd /c "timeout /t 1 >nul & start http://localhost:%PORT%/"

where python >nul 2>nul
if %errorlevel%==0 (
  REM No-Cache-Server bevorzugen, damit Updates sofort sichtbar sind.
  python serve.py
  goto :eof
)

where npx >nul 2>nul
if %errorlevel%==0 (
  npx --yes serve -l %PORT%
  goto :eof
)

echo Weder Python noch Node gefunden - bitte eines davon installieren.
pause
