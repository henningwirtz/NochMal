# NOCH MAL! – Browser-Nachbau

Ein regelgetreuer Nachbau des Würfel-/Kreuzelspiels **NOCH MAL!** (Schmidt Spiele,
Inka & Markus Brand) als reine Web-App – **Vanilla JavaScript, kein Build-Schritt**.

- Lokales **Pass-and-Play** (1–6 Spieler) **und** **KI-Gegner** (heuristisch)
- Vollständige Wertung: Spalten A–O, Farb-Bonus (5/3), 8 Joker-„!"-Felder, Stern-Malus (−2)
- **Solo-Variante** (2+2 Würfel, 30 Würfe, Level-Tabelle)
- Deutsche Oberfläche

## Starten

ES-Module benötigen einen HTTP-Server (kein `file://`). Im Projektordner:

```powershell
python -m http.server 8000
```

Dann im Browser öffnen: <http://localhost:8000/>

Alternativen: `npx serve` oder die VS-Code-Erweiterung „Live Server".

Im Setup Spieleranzahl wählen, je Spieler Name und **Mensch/KI** festlegen,
dann **Spiel starten**. (1 Spieler = Solo-Variante.)

## Spielregeln (Kurzfassung)

Der aktive Spieler würfelt alle 6 Würfel und nimmt 1 Farb- + 1 Zahlenwürfel; die
anderen wählen aus den 4 übrigen (in den ersten 3 Würfen aus allen 6). Es werden so
viele zusammenhängende Felder der Farbe angekreuzt, wie die Zahl zeigt – benachbart
zu bereits Angekreuztem oder in der Startspalte H beginnend. Schwarzer Würfel =
beliebige Farbe, „?" = Zahl 1–5 (je Joker ein „!"-Feld). Volle Spalten und komplette
Farben geben Punkte; bei 2 kompletten Farben endet das Spiel.

## Tests

- **Im Browser:** <http://localhost:8000/tests.html> (Regel- und Wertungstests)
- **In Node:**

```powershell
npm test          # bzw. node js/tests/node-runner.mjs
node js/tests/sim.mjs   # Headless-Smoke-Test: komplette KI-Partien
```

## Projektstruktur

```
index.html / tests.html        Einstieg / Testseite
css/styles.css                 Layout
js/main.js                     Setup & Bootstrap
js/data/board.js               Spielplan (15x7-Farbraster, Sterne)
js/core/                       constants, dice, rules, sheet, game, ai
js/ui/                         boardView, controls, flow
js/tests/                      testsuite, node-runner, sim
```

## Hinweis zum Spielplan

Das 15×7-Farbraster ist eine **regelgetreue Rekonstruktion im Stil der offiziellen
Vorlage** und strukturell validiert (5 Farben, jede Zelle vom Start erreichbar). Da
die Engine vollständig datengetrieben ist, lässt sich das Layout in
[`js/data/board.js`](js/data/board.js) jederzeit gegen ein exaktes Original
austauschen, ohne Code zu ändern.
