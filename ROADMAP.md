# Roadmap / geplante Features

Ausgelagert aus `CLAUDE.md`. Wird Stück für Stück abgearbeitet; einzelne Features
werden bei Bedarf separat geplant. Erledigte Punkte als `[x]` markieren bzw. nach
unten/„Erledigt" verschieben.

## KI / Bots
- [x] **Leopold-Bot (Stufe „schwer")** – die schwerste Stufe heißt im Menü
  „Leopold – schwierig" (intern weiter `'schwer'`) und spielt deutlich stärker
  (~73 % Siege gg. „mittel", ~92 % gg. „leicht" im Headless-Test). Neue Taktik-Terme
  in `chooseMove`/`evaluatePlacement` (`ai.js`, nur Stufe `schwer`):
  *keine „Waisen"* (Strafe je neu isoliertem Farbfeld, `countColorOrphans`),
  *Außenspalten* (Fortschritt × Spaltenwert, quadratisch → Rand A/O = 5/3 zuerst),
  *Defensive* (`denialBonus`: am eigenen Zug bevorzugt den **einzigen** Würfel einer
  Farbe verbrauchen, die der stärkste Gegner braucht → passive Mitspieler bekommen
  genau diese 2 Würfel nicht), *Endspiel-Timing* (führt er, drängt er aufs Ende
  = 2. Farbe; liegt er hinten, meidet er den beendenden Zug). Gegner-Infos kommen über
  `buildAiContext` in `flow.js` (`opponents`/`isActive`/`scoreDiff`/`leaderName`).
  Frechen Sprüche-Pool (`LINES` in `ai.js`, situationsabhängig via `classifyMove`,
  spricht den Führenden beim Namen an) im Kommentarfeld (`leopoldThinking`/
  `leopoldComment`, gezeigt in `flow.js` `aiChoose`). „leicht"/„mittel" unverändert
  (neue Gewichte dort 0). Tests/Sim laufen unverändert grün.
- [x] **Kamuran-Bot (Stufe „leicht")** – die leichte Stufe heißt im Menü
  „Kamuran – leicht" (intern weiter `'leicht'`). Spielt erkennbar schlecht (verliert
  ~40:0 gg. „mittel"): `CFG.leicht` mit viel Zufall (`jitter`), fast gratis Jokern,
  **negativem `strand`** (er wird sogar belohnt, wenn er kleine 1er/2er-Reste neu
  erzeugt – der Strand-Term ist dafür asymmetrisch: Kamuran wird nur fürs
  Löcher-*Reißen* belohnt, fürs Füllen aber nicht bestraft, sonst würde er lieber
  passen) und ~5 % grundlosem Passen (`chooseMove`). Tollpatschig-selbstironischer
  Sprüche-Pool (`LINES_K` in `ai.js`, situationsabhängig via `classifyKamuranMove`,
  Patzer-Erkennung über die Fragment-Differenz) inkl. Insider-Gags (Oki, Maggis
  Outfits, drei Mathekurse, über Bauingenieure herziehen, „besser als der Oskar"):
  `kamuranThinking`/`kamuranComment`. Er **bewundert** den Menschen statt ihn zu
  verspotten (`kamuranReactToHuman`). Verdrahtet in `flow.js` über `aiPersona`
  (Leopold/Kamuran reden, „mittel" schweigt). Tests/Sim grün.
- [x] **Oskar-Bot (Stufe „mittel")** – die mittlere Stufe heißt im Menü
  „Oskar – mittel" (intern weiter `'mittel'`, `CFG.mittel` unverändert – reine
  Sprech-Persönlichkeit, keine Spielstärken-Änderung). Tollpatschig-verklatschter
  Charakter: redet ständig über sein Privatleben statt übers Spiel (Insider-Themen
  Dirk, Thermo-Kurs, Guinness, „12 Klassiker im Ernstfall", „Bachlauf unter 40",
  Überstunden-Frust, „schwör auf Mutter"). Sprüche-Pool (`LINES_O` in `ai.js`,
  situationsabhängig via `classifyOskarMove`, identische Fragment-Logik wie
  Kamurans `classifyKamuranMove`): `oskarThinking`/`oskarComment`. Reagiert anders
  als Leopold/Kamuran auf den Menschen – nicht spöttisch, nicht bewundernd, sondern
  **selbstbezogen** (`oskarReactToHuman`: meist Ablenkung auf eigene Themen, nur
  bei auffällig gutem Zug eine beiläufige Erwähnung). Kontert gelegentlich Kamurans
  „der Oskar"-Sticheleien (`LINES_K.general`/`LINES_K.behind`, unverändert stehen
  gelassen). Verdrahtet in `flow.js` über `aiPersona` (jetzt reden alle drei
  Stufen). Tests/Sim grün.
- **Weitere Bot-Namen & Charaktere** – langfristig eigene Bots im Setup anlegbar.
  → `ai.js`/`flow.js`, `main.js` (Setup/Namen), ggf. `js/data/bots.js`.
- **KI-Spielzüge weiter optimieren** – z.B. flacher Lookahead, Zahlenwürfel-Denial,
  Spalten-Erstabschluss global priorisieren. → `ai.js`.

## Spielregeln / Varianten
- [x] **Modus-Auswahl beim Start** – auf der Startseite (oben im Setup) zwei Modus-Karten
  (`.mode-select`/`.mode-card`, `index.html`): **Gether** (`data-mode="a"`) = „Gegen die KI",
  zusammen an **einem** Gerät (KI-Gegner, alle Boards, strenge Validierung) und **PvP**
  (`data-mode="b"`) = „Digitaler Notizblock", jeder am **eigenen** Handy. PvP ist ein
  1-Spieler-Spiel (`relaxed:true`, **kein** `soloMode`): weiter würfeln + normale Wertung/
  Spielende/Bestenliste (Label „Notizblock"), aber jedes **erreichbare** Feld (Startspalte H
  oder neben einem Kreuz) frei ankreuzbar – Farbe und Anzahl egal. KI-/Mehrspieler-Setup-
  Felder tragen `mode-a-only` und werden via `body.mode-notepad` ausgeblendet; der Modus
  wird in `saveSettings({ mode })` gemerkt.
  → `main.js` (`applyMode`, Start-Verzweigung, `renderSlots`), `game.js`
  (`relaxed`-Flag + `submitMarks`), `rules.js` (`isRelaxedPlacement`), `controls.js`
  (`redrawRelaxed`/freies `onCellClick`), `flow.js` (`submitMarks`-Zweig, `notepad`-Flag).
- [x] **PvP-Boni + Spielende-Fix** – Im PvP sind **Spalten-Buchstaben** (über dem Block)
  und **Farb-Bonus-Boxen** (unter dem Block) anklickbar: ein Klick heißt „ein anderer
  Spieler hat das zuerst geschlossen" → Oberwert gestrichen (`strikeColumnByOther`/
  `strikeColorByOther` in `game.js`; idempotent, stuft einen bereits voll vergebenen Wert
  herab). Eigene **fertige** Spalten/Farben werden in `resolveRound` (`relaxed`-Zweig,
  `_awardCompletedRelaxed`) automatisch gewertet – voll, oder reduziert falls gestrichen.
  **Spielende grid-basiert** (beide Modi): 2 Farben vollständig (`completedColorGridCount`)
  **oder** alle Spalten zu (`allColumnsComplete`) → sofort nach „Bestätigen" Ende + Einfrieren
  (`sheet.js`-Helfer). → `boardView.js` (`onColumnClick`/`onColorClick`, `.clickable`/
  `.struck`), `flow.js`/`controls.js` (Handler durchreichen/verdrahten), `styles.css`.
- [x] **Neue Blöcke (auswählbar)** – mehrere Spielpläne im Setup wählbar; Engine
  datengetrieben. Registry `BOARDS` + `setActiveBoard(id)` in `board.js` (Live-Binding-
  Exporte `GRID`/`STARS`/`COLOR_COUNTS`), Auswahl-Overlay `#block-modal` in `index.html`/
  `main.js`, gemerkt via `saveSettings` (`boardId`). Aktuell: Standard, Pink (sauberes
  Foto), Grün/Blau (grob aus unscharfem Bild, ggf. noch nicht 1:1 – per `raw`/`stars`
  korrigierbar). *Offen:* Grün/Blau mit scharfen Einzelfotos exakt machen; weitere
  (Encore-)Blöcke I–VI.
- **Sternstrafe je Block** – optional je Block eine eigene Stern-Strafe (Vorlagen zeigen
  −2 bzw. −3); aktuell global `STAR_PENALTY = 2` für alle Blöcke. Umsetzung: Strafe in den
  `BOARDS`-Eintrag aufnehmen und in `computeScore`/`sheet.js` statt der Konstante nutzen.
  → `board.js`, `constants.js`, `sheet.js`.
- [x] **Joker als 6** – Zahlenjoker darf 6 zusammenhängende Felder ankreuzen.
  Als Hausregel „Zahlenjoker auch als 6" (`#rule-joker-six`) umgesetzt.
- [x] **Minuspunkte / Pass-Felder** – jedes Passen kostet 1 Punkt.
  Als Hausregel „Minuspunkt pro Pass" (`#rule-pass-penalty`) umgesetzt.
- [x] **Strengere Sternstrafe** – nicht angekreuzte Sterne kosten −3 statt −2.
  Als Hausregel „Strengere Sternstrafe (−3)" (`#rule-star-penalty`) umgesetzt.

## UI / Darstellung
- [x] **Quer-Modus optimieren** – Landscape-Layout, Block ohne Horizontal-Scroll.
  *Erledigt:* Media Query `(orientation: landscape) and (max-height: 600px)` in
  `styles.css` – `#game-screen` wird zum Grid (Block links voller Höhe, Würfel +
  Aktionen + Sidebar als rechte Spalte via `display: contents` auf `.game-main`),
  `--cell` zusätzlich höhenbegrenzt (kein H-/V-Scroll des Blocks).
- **Handy-Spielmodus optimieren** – durchgängig bedienbares Layout am Smartphone:
  - [x] *Handy quer für bessere Übersicht* – Querformat als zweispaltiges Grid
    (Block | Steuerspalte), nutzt die Landscape-Breite. Aktiver Block ist
    vollständig & fixiert (sticky + `order:-1`), übrige Blöcke per Runterscrollen.
    Blöcke liegen **flach** auf der Seite (im Landscape `.player-board`
    `overflow:visible; width:auto`, kein scrollbares Block-Fenster mehr, das das
    Wertungs-Panel abschnitt). Neben dem Raster nur **Farb-Bonus + Joker** (kompakt,
    voll sichtbar); die Punkte-Aufschlüsselung (`.totals`) ist im Querformat
    ausgeblendet – Gesamtpunkte stehen im Block-Kopf und im Header-Chip.
    `--cell: clamp(13px, min((100vw−480px)/15, (100dvh−96px)/9), 26px)` so bemessen,
    dass Raster + Panel garantiert in die Board-Spalte und Höhe passen.
    (**Hochformat noch offen.**)
  - [x] *Aufgeräumte Steuerspalte rechts* – das Landscape-Grid hat rechts feste
    Zeilen `dice / roll / actions / comment`: Würfel-Anzeige → neuer **🎲 Würfeln**-
    Button (`#roll-btn`) → Aktionen als Stapel in Reihenfolge **Bestätigen, Passen,
    Rückgängig** (`.action-bar { flex-direction: column }`) → flache **Kommentar-Box**
    (`#commentary`, `.commentary-box`) für Systemhinweise/letzte Ansage. Die separate
    Punktestand/Log-Spalte (`.sidebar`) und `#message` sind im Querformat
    ausgeblendet; Würfeln-Button + Kommentar-Box sind global `display:none` und nur im
    Landscape sichtbar. (**Hochformat noch offen.**)
  - [x] *Würfeln-Button funktional* – beim Mensch-Aktivspieler deckt `waitForRoll`
    (in `flow.js`) das bereits in `beginRound()` gewürfelte Ergebnis erst nach Klick
    auf „Würfeln" per `animateRoll` auf; bei KI-Aktivspieler wird wie bisher direkt
    gewürfelt. `control.cancel` löst das Warten bei „Spiel beenden" sauber auf.
  - [x] *Textballast entfernt* – kein „… ist am Zug (aktiv)" mehr; `setTurnInfo`
    schreibt stattdessen einen kompakten Punktestand-Chip (`#turn-info`) in den
    schmalen Header oben rechts (Punktestand + Spiel beenden + Ton + Nachtmodus).
  - [x] *Alle wichtigen Buttons gleichzeitig sichtbar & bedienbar* – im Querformat
    bleiben Hell/Dunkel + Ton (`#top-controls`) fix oben rechts, der Header-Inhalt
    inkl. „Spiel beenden" rutscht via `padding-right` darunter weg → kollisionsfrei,
    gut tappbar. (**Hochformat noch zu prüfen.**)
  - [x] *Kein Scrollen für Aktionen* – Würfel, Würfeln-Button, Aktionsleiste und
    Block liegen im Landscape-Grid gleichzeitig sichtbar; nur die Kommentar-Box
    scrollt bei Bedarf. (**Hochformat noch offen.**)
  → `styles.css` (Media Query `orientation: landscape`, Grid-Areas
  `board/header/dice/roll/actions/comment`, `.roll-btn`, `.commentary-box`,
  `.turn-info`-Chip), `index.html` (`#roll-btn`, `#commentary`), `flow.js`
  (`waitForRoll`, `setTurnInfo`, `announce` → Kommentar-Box), `controls.js`
  (Aktions-Reihenfolge, `setHint` schreibt in `#message` + `#commentary`), `main.js`
  (DOM-Refs `rollBtn`/`commentary`).
- **Spieler-Stammliste mit Bildern/Emojis** – gespeicherte Liste bekannter Spieler
  (z.B. „Henning") mit fest zugewiesenem Bild/Emoji; im Setup auswählbar statt jedes Mal
  neu zu tippen, runden­übergreifend wiederverwendet. Avatar erscheint in Setup, Spiel
  und Bestenliste. → `storage.js` (Spieler-Stammliste persistieren), `main.js` (Setup:
  Auswahl/Anlegen/Zuweisen), `boardView.js`/`flow.js` (Anzeige).
- [x] **Wischen/Drag zum Auswählen** – Finger/Maus über Felder ziehen; alle gültigen
  Felder auf dem Weg werden automatisch zur Auswahl hinzugefügt, ungültige übersprungen.
  Umgesetzt über `pointerdown`/`pointermove`/`pointerup` mit `elementFromPoint`; kein
  separater Picker, Validierung über das bestehende `highlight`-Set bzw.
  `isRelaxedPlacement`. → `boardView.js` (`data-r`/`data-c`, `onCellPointerDown`),
  `controls.js` (Drag-Zustand, `onCellEnterDrag`), `flow.js` (`renderBoards`-Durchleitung).

## Ton / Sprache
- **Niederländische Ansage** – optionale Sprachausgabe (Web Speech API, `nl-NL`), sagt
  den Zug an, z.B. „drie geel" bei 3× Gelb. Toggle analog zum bestehenden Mute.
  → `sound.js` (TTS-Ansage), `main.js`/`prefs` (Toggle).

## Später (Backend nötig – zurückgestellt)
- **Scoreboard-Backend** – server-/cloudbasierte globale Bestenliste.
- **Online-Mehrspieler** – gemeinsam spielen, jeder kreuzt selbst an.
