@echo off
setlocal

rem  Holt den neuesten Stand und baut das Windows-Paket der Sammlung.
rem
rem  Gearbeitet wird in dem Repository, in dem dieses Skript liegt — nicht in
rem  einem festen Pfad. So laesst es sich mitkopieren, ohne dass jemand den
rem  Ordner darin nachtraegt.

cd /d "%~dp0.."
echo Arbeitsordner: %CD%
echo.

echo [1/4] git fetch -p
call git fetch -p
if errorlevel 1 goto :fehler

echo.
echo [2/4] git pull
call git pull
if errorlevel 1 goto :fehler

echo.
echo [3/4] npm install
rem  Nach jedem Pull noetig: kommen neue Pakete dazu, sind die Workspaces
rem  sonst nicht verlinkt, und der Build bricht mit einem Aufloesungsfehler ab.
call npm install
if errorlevel 1 goto :fehler

echo.
echo [4/4] npm run dist:win
rem  Baut die Sammlung nach apps\shell\release. Die einzelne Anwendung liefe
rem  unter dist:backstory:win.
call npm run dist:win
if errorlevel 1 goto :paketfehler

echo.
echo Fertig. Das Paket liegt in apps\shell\release
echo   Installer:  apps\shell\release\*.exe
echo   Entpackt:   apps\shell\release\win-unpacked\TTRPG-Tools.exe
exit /b 0

:paketfehler
echo.
echo Der Paketbau ist fehlgeschlagen.
echo.
echo Steht in der Meldung oben "Cannot create symbolic link" oder "Dem Client
echo fehlt ein erforderliches Recht", dann liegt es nicht am Code:
echo electron-builder entpackt sein Signierpaket, das Symlinks enthaelt, und
echo die darf ein normales Konto unter Windows nicht anlegen.
echo.
echo   - Entwicklermodus einschalten: Einstellungen, System, Fuer Entwickler
echo     ODER dieses Skript per Rechtsklick als Administrator starten
echo   - danach diesen Ordner loeschen, sonst liegt das halb Entpackte im Weg:
echo     %LOCALAPPDATA%\electron-builder\Cache\winCodeSign
echo.
echo Die entpackte Anwendung ist trotzdem meist schon fertig:
echo   apps\shell\release\win-unpacked\TTRPG-Tools.exe
exit /b 1

:fehler
echo.
echo Abgebrochen — der Schritt oben ist fehlgeschlagen.
exit /b 1
