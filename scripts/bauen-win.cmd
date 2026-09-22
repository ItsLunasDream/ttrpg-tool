@echo off
setlocal

rem  Holt den neuesten Stand und baut das Windows-Paket der Sammlung.
rem
rem  Gearbeitet wird in dem Repository, in dem dieses Skript liegt - nicht in
rem  einem festen Pfad. So laesst es sich mitkopieren, ohne dass jemand den
rem  Ordner darin nachtraegt.
rem
rem  ZWEI DINGE, DIE HIER ANDERS SIND ALS FRUEHER, UND WARUM
rem  ======================================================
rem  1. Jeder Ausgang haelt an (siehe :ende). Vorher endete jeder Fehlerpfad
rem     mit exit /b, und beim Doppelklick schloss sich damit das Fenster
rem     sofort - die Meldung war weg, bevor man sie lesen konnte. Es sah aus,
rem     als waere die Anwendung abgestuerzt, dabei stand der Grund da.
rem  2. npm wird mit "cmd /c" gestartet und nicht mit "call". npm ist selbst
rem     eine Batchdatei, und je nach Fassung beendet sie beim Abbruch die
rem     ganze Sitzung statt nur sich selbst. Mit cmd /c laeuft sie in einer
rem     eigenen und kann dieses Fenster nicht mitnehmen.
rem
rem  Welcher Schritt gelaufen ist, landet zusaetzlich in bauen-win.log. Das
rem  ist ein Schrittprotokoll und kein Mitschnitt: Batch kann Ausgabe nicht
rem  gleichzeitig auf den Schirm und in eine Datei schreiben, und der
rem  uebliche Trick mit einer Pipe zerstoert den Rueckgabewert des Befehls.
rem  Wer den ganzen Lauf braucht, startet das Skript mit
rem      bauen-win.cmd ^> lauf.txt 2^>^&1

cd /d "%~dp0.."
set "LOGDATEI=%CD%\bauen-win.log"
set "PAKETORDNER=%CD%\apps\shell\release"

rem  Neues Protokoll je Lauf: ein angehaengtes waechst sonst endlos und man
rem  liest beim Nachsehen den Lauf von vorgestern.
echo Lauf vom %DATE% %TIME%> "%LOGDATEI%"

call :sag "Arbeitsordner: %CD%"
call :sag "Protokoll:     %LOGDATEI%"
call :sag ""

call :sag "[1/4] git fetch -p"
call git fetch -p
if errorlevel 1 goto :fehler

call :sag ""
call :sag "[2/4] git pull"
call git pull
if errorlevel 1 goto :fehler

call :sag ""
call :sag "[3/4] npm install"
rem  Nach jedem Pull noetig: kommen neue Pakete dazu, sind die Workspaces
rem  sonst nicht verlinkt, und der Build bricht mit einem Aufloesungsfehler ab.
cmd /c npm install
if errorlevel 1 goto :installfehler

call :sag ""
call :sag "[4/4] npm run dist:win"
rem  Baut die Sammlung nach apps\shell\release. Die einzelne Anwendung liefe
rem  unter dist:backstory:win.
cmd /c npm run dist:win
if errorlevel 1 goto :paketfehler

call :sag ""
call :sag "Fertig. Das Paket liegt in apps\shell\release"
call :sag "  Installer:  apps\shell\release\*.exe"
call :sag "  Entpackt:   apps\shell\release\win-unpacked\TTRPG-Tools.exe"
call :sag ""

if exist "%PAKETORDNER%" (
  call :sag "Oeffne %PAKETORDNER% ..."
  rem  Ohne Pruefung auf errorlevel: der Explorer meldet auch dann einen
  rem  Fehler, wenn das Fenster aufgeht.
  start "" "%PAKETORDNER%"
) else (
  call :sag "Der Ordner %PAKETORDNER% ist nicht da - der Bau hat nichts abgelegt."
)
goto :ende

:installfehler
call :sag ""
call :sag "npm install ist fehlgeschlagen."
call :sag ""
call :sag "Die haeufigsten Gruende, in der Reihenfolge, in der man sie prueft:"
call :sag "  - Kein Netz oder eine Sperre davor. npm laedt beim ersten Mal viel."
call :sag "  - Node fehlt oder ist zu alt. Gebraucht wird die Fassung aus .nvmrc."
call :sag "  - Ein halb entpacktes node_modules aus einem abgebrochenen Lauf."
call :sag "    Dann: den Ordner node_modules loeschen und neu starten."
call :sag ""
call :sag "Die genaue Meldung steht oben und in %LOGDATEI%."
goto :ende

:paketfehler
call :sag ""
call :sag "Der Paketbau ist fehlgeschlagen."
call :sag ""
call :sag "Steht in der Meldung oben 'Cannot create symbolic link' oder 'Dem"
call :sag "Client fehlt ein erforderliches Recht', dann liegt es nicht am Code:"
call :sag "electron-builder entpackt sein Signierpaket, das Symlinks enthaelt,"
call :sag "und die darf ein normales Konto unter Windows nicht anlegen."
call :sag ""
call :sag "  - Entwicklermodus einschalten: Einstellungen, System, Fuer Entwickler"
call :sag "    ODER dieses Skript per Rechtsklick als Administrator starten"
call :sag "  - danach diesen Ordner loeschen, sonst liegt das halb Entpackte im Weg:"
call :sag "    %LOCALAPPDATA%\electron-builder\Cache\winCodeSign"
call :sag ""
call :sag "Die entpackte Anwendung ist trotzdem meist schon fertig:"
call :sag "  apps\shell\release\win-unpacked\TTRPG-Tools.exe"
if exist "%PAKETORDNER%" start "" "%PAKETORDNER%"
goto :ende

:fehler
call :sag ""
call :sag "Abgebrochen - der Schritt oben ist fehlgeschlagen."
call :sag "Die genaue Meldung steht oben und in %LOGDATEI%."
goto :ende

rem  Schreibt eine Zeile auf den Schirm UND ins Protokoll. Zweimal dasselbe
rem  zu tippen waere die Sorte Doppelung, bei der eines davon irgendwann
rem  vergessen wird.
:sag
rem  Ein leerer Text braucht "echo." - ein nacktes echo meldet sonst, ob es
rem  selbst ein- oder ausgeschaltet ist, und das mitten im Bauprotokoll.
if "%~1"=="" (
  echo.
  echo.>> "%LOGDATEI%"
) else (
  echo %~1
  echo %~1>> "%LOGDATEI%"
)
exit /b 0

rem  DAS FENSTER BLEIBT OFFEN, bis jemand eine Taste drueckt. Auch im
rem  Erfolgsfall: wer das Skript aus einer Konsole startet, drueckt einmal
rem  Enter, und wer es doppelklickt, sieht ueberhaupt, was passiert ist.
:ende
echo.
pause
exit /b 0
