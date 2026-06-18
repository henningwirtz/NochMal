// ============================================================================
// core/ai.js
// Heuristik-KI (eine Staerke). Bewertet alle moeglichen Zuege aus dem
// verfuegbaren Wuerfel-Pool und waehlt den besten - oder passt.
// ============================================================================

import {
  COLOR_ORDER,
  COLUMN_TOP,
  COLUMN_BOTTOM,
  COLOR_BONUS_FIRST,
  COLOR_BONUS_LATER,
  STAR_PENALTY,
  JOKER,
  GRID_ROWS,
  GRID_COLS,
} from './constants.js';
import { legalPlacements } from './rules.js';
import { hasStar } from '../data/board.js';

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// Bewertet eine konkrete Platzierung. Markiert temporaer und macht rueckgaengig.
function evaluatePlacement(sheet, cells, color, jokersUsed) {
  for (const [r, c] of cells) sheet.marks[r][c] = true;

  let score = cells.length; // jedes angekreuzte Feld ist Fortschritt

  const cols = new Set(cells.map(([, c]) => c));
  for (const col of cols) {
    if (sheet.isColumnComplete(col)) {
      score += sheet.columnTopStruck[col] ? COLUMN_BOTTOM[col] : COLUMN_TOP[col];
      score += 2; // Spaltenabschluss extra belohnen
    } else {
      let inCol = 0;
      for (let r = 0; r < GRID_ROWS; r++) if (sheet.marks[r][col]) inCol++;
      score += inCol * 0.3; // Fortschritt Richtung Spaltenabschluss
    }
  }

  if (sheet.isColorComplete(color)) {
    score += sheet.colorFirstStruck[color] ? COLOR_BONUS_LATER : COLOR_BONUS_FIRST;
    score += 2;
  } else {
    score += sheet.colorMarkedCount(color) * 0.05;
  }

  for (const [r, c] of cells) {
    if (hasStar(r, c)) score += STAR_PENALTY; // vermeidet -2 bei Spielende
  }

  // Frontier: neue Anschlussmoeglichkeiten foerdern Beweglichkeit.
  let frontier = 0;
  for (const [r, c] of cells) {
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS && !sheet.marks[nr][nc]) {
        frontier++;
      }
    }
  }
  score += frontier * 0.08;

  for (const [r, c] of cells) sheet.marks[r][c] = false;

  score -= jokersUsed * 1.5; // Joker sind knapp und am Ende +1 wert
  return score;
}

// Liefert die moeglichen (color, jokers) bzw. (count, jokers) Auswahlen eines Wuerfels.
function colorOptions(face, jokersRemaining) {
  if (face === JOKER) {
    return jokersRemaining > 0 ? COLOR_ORDER.map((c) => ({ color: c, jokers: 1 })) : [];
  }
  return [{ color: face, jokers: 0 }];
}
function countOptions(face, jokersRemaining) {
  if (face === JOKER) {
    return jokersRemaining > 0 ? [1, 2, 3, 4, 5].map((n) => ({ count: n, jokers: 1 })) : [];
  }
  return [{ count: face, jokers: 0 }];
}

// Waehlt den besten Zug. Rueckgabe: null (passen) oder
// { colorId, numberId, color, count, cells, jokersUsed }.
export function chooseMove(sheet, pool) {
  let best = null;
  let bestScore = 0.0001; // nur echte (positive) Zuege spielen

  for (const cDie of pool.colorDice) {
    for (const nDie of pool.numberDice) {
      for (const co of colorOptions(cDie.face, sheet.jokersRemaining())) {
        for (const no of countOptions(nDie.face, sheet.jokersRemaining())) {
          const jokersUsed = co.jokers + no.jokers;
          if (jokersUsed > sheet.jokersRemaining()) continue;

          const placements = legalPlacements(sheet, co.color, no.count);
          for (const cells of placements) {
            const s = evaluatePlacement(sheet, cells, co.color, jokersUsed);
            if (s > bestScore) {
              bestScore = s;
              best = {
                colorId: cDie.id,
                numberId: nDie.id,
                color: co.color,
                count: no.count,
                cells,
                jokersUsed,
              };
            }
          }
        }
      }
    }
  }
  return best;
}
