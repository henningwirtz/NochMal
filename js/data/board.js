// ============================================================================
// data/board.js
// ----------------------------------------------------------------------------
// Der Standard-Spielplan von "NOCH MAL!": 15 Spalten (A-O) x 7 Zeilen = 105
// farbige Kaestchen, plus Sternfelder und die Startspalte H.
//
// Das Farbraster und die Sternpositionen wurden 1:1 vom Originalblock
// (Schmidt Spiele) uebertragen. Da die Engine vollstaendig datengetrieben ist,
// genuegt zum Austausch des Spielplans eine Aenderung dieser Datei.
//
// Farbcodes im Raster:
//   y = gelb, n = gruen, b = blau, r = rot (pink/magenta), o = orange
// ============================================================================

import { COLORS } from '../core/constants.js';

// Kurzcode im Raster -> interner Farbschluessel
const CODE_TO_COLOR = {
  y: COLORS.GELB,
  n: COLORS.GRUEN,
  b: COLORS.BLAU,
  r: COLORS.ROT,
  o: COLORS.ORANGE,
};

// 7 Zeilen, jeweils 15 Spalten (A..O). Startspalte H = Index 7.
//          ABCDEFGHIJKLMNO
const RAW_GRID = [
  'nnnyyyynbbboyyy',
  'onynyyoorbboonn',
  'bnrnnnnrrryyonn',
  'brrnoobbnnyyorb',
  'roooorbbooorrrr',
  'rbbrrrryyorbbbo',
  'yybbbbryyynnnoo',
];

// Sternpositionen [Zeile, Spalte] - vom Originalblock uebernommen (14 Sterne).
export const STARS = [
  [0, 7], [0, 11],
  [1, 2], [1, 4], [1, 9],
  [2, 0], [2, 6],
  [3, 5], [3, 13],
  [5, 1], [5, 3], [5, 8], [5, 10],
  [6, 12],
];

export const ROWS = 7;
export const COLS = 15;

// GRID[row][col] -> Farbschluessel (z.B. COLORS.GELB)
export const GRID = RAW_GRID.map((row) =>
  row.split('').map((ch) => {
    const color = CODE_TO_COLOR[ch];
    if (!color) throw new Error(`Unbekannter Farbcode "${ch}" im Spielplan`);
    return color;
  })
);

// Schnelle Pruefung, ob ein Feld einen Stern traegt.
const STAR_SET = new Set(STARS.map(([r, c]) => `${r},${c}`));
export function hasStar(row, col) {
  return STAR_SET.has(`${row},${col}`);
}

// Anzahl der Felder je Farbe (fuer die Farb-Komplettierung).
export const COLOR_COUNTS = (() => {
  const counts = {};
  for (const row of GRID) {
    for (const color of row) {
      counts[color] = (counts[color] || 0) + 1;
    }
  }
  return counts;
})();

// ----------------------------------------------------------------------------
// Strukturvalidierung des Spielplans (wirft bei Inkonsistenzen).
// ----------------------------------------------------------------------------
export function validateBoard() {
  const problems = [];

  if (GRID.length !== ROWS) problems.push(`Erwartet ${ROWS} Zeilen, gefunden ${GRID.length}`);
  GRID.forEach((row, r) => {
    if (row.length !== COLS) problems.push(`Zeile ${r} hat ${row.length} statt ${COLS} Spalten`);
  });

  const total = GRID.reduce((sum, row) => sum + row.length, 0);
  if (total !== ROWS * COLS) problems.push(`Erwartet ${ROWS * COLS} Felder, gefunden ${total}`);

  if (Object.keys(COLOR_COUNTS).length !== 5) {
    problems.push(`Erwartet 5 Farben, gefunden ${Object.keys(COLOR_COUNTS).length}`);
  }

  // Jede Zelle muss orthogonal vom Startspalten-Feld erreichbar sein (Brett zusammenhaengend).
  const seen = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const stack = [[0, 7]];
  seen[0][7] = true;
  let reached = 1;
  while (stack.length) {
    const [r, c] = stack.pop();
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !seen[nr][nc]) {
        seen[nr][nc] = true;
        reached++;
        stack.push([nr, nc]);
      }
    }
  }
  if (reached !== ROWS * COLS) problems.push(`Nur ${reached}/${ROWS * COLS} Felder vom Start erreichbar`);

  // Sterne muessen innerhalb des Bretts liegen.
  for (const [r, c] of STARS) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) problems.push(`Stern ausserhalb des Bretts: ${r},${c}`);
  }

  if (problems.length) throw new Error('Ungueltiger Spielplan:\n - ' + problems.join('\n - '));
  return true;
}
