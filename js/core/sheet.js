// ============================================================================
// core/sheet.js
// Zustand eines einzelnen Spielblatts: angekreuzte Felder, Joker, gewertete
// Spalten/Farben und die Endwertung.
// ============================================================================

import {
  GRID_ROWS,
  GRID_COLS,
  COLOR_ORDER,
  COLUMN_TOP,
  COLUMN_BOTTOM,
  JOKER_BOXES,
  UNUSED_JOKER_BONUS,
  STAR_PENALTY,
  COLUMN_BET_MULTIPLIER,
} from './constants.js';
import { GRID, COLOR_COUNTS, hasStar, STARS } from '../data/board.js';

export class Sheet {
  constructor() {
    this.marks = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
    this.jokersUsed = 0;
    this.hasMarkedAny = false;

    // Hausregel "Minuspunkt pro Pass": Anzahl der Pässe und die Strafe je Pass
    // (0 = Regel aus). Game setzt die Rate je Blatt; so bleibt computeScore() parameterlos.
    this.passes = 0;
    this.passPenalty = 0;

    // Hausregel "Strengere Sternstrafe": Game setzt die Rate je Blatt (2 oder 3).
    this.starPenalty = STAR_PENALTY;

    // Wertung: pro Spalte der diesem Spieler gutgeschriebene Wert (oder null).
    this.columnAward = Array(GRID_COLS).fill(null);
    // Spalten, bei denen der obere Wert bereits von einem anderen vergeben ist.
    this.columnTopStruck = Array(GRID_COLS).fill(false);

    // Farb-Bonus: Farbe -> gutgeschriebener Wert.
    this.colorAward = {};
    // Farben, bei denen der erste (5er) Bonus bereits vergeben ist.
    this.colorFirstStruck = {};

    // Hausregel "Geheimziel-Karten": zufaellig zugelostes Ziel (siehe
    // data/goals.js), null = Regel aus. Wird von Game einmalig zu Spielbeginn
    // gesetzt und aendert sich danach nicht mehr.
    this.secretGoal = null;

    // Hausregel "Spalten-Wette": zufaellig geloste Spalte, deren Wert sich bei
    // Abschluss verdoppelt (awardColumn). null = Regel aus.
    this.betColumn = null;
  }

  isMarked(r, c) {
    return this.marks[r][c];
  }

  color(r, c) {
    return GRID[r][c];
  }

  // Kreuzt eine Liste von Feldern [[r,c], ...] an.
  mark(cells) {
    for (const [r, c] of cells) {
      this.marks[r][c] = true;
    }
    if (cells.length) this.hasMarkedAny = true;
  }

  jokersRemaining() {
    return JOKER_BOXES - this.jokersUsed;
  }

  useJokers(n) {
    this.jokersUsed += n;
  }

  // PvP/Notizblock: einen Joker per Antippen als "verwendet" markieren bzw. wieder
  // freigeben. Die Boxen füllen sich von links; Antippen einer noch freien Box
  // markiert alle bis dorthin als verwendet, Antippen einer schon verwendeten gibt
  // ab dort wieder frei. Jeder verwendete Joker kostet +1 (entfällt als Bonus).
  toggleJokerAt(i) {
    this.jokersUsed = (i < this.jokersUsed) ? i : i + 1;
  }

  // --- Spalten -------------------------------------------------------------
  isColumnComplete(col) {
    for (let r = 0; r < GRID_ROWS; r++) {
      if (!this.marks[r][col]) return false;
    }
    return true;
  }

  // Liefert die Spalten, die mit dieser Markierung NEU komplett geworden sind.
  newlyCompletedColumns(cells) {
    const cols = new Set(cells.map(([, c]) => c));
    const result = [];
    for (const col of cols) {
      if (this.columnAward[col] === null && this.isColumnComplete(col)) {
        result.push(col);
      }
    }
    return result;
  }

  awardColumn(col, isTop) {
    let value = isTop ? COLUMN_TOP[col] : COLUMN_BOTTOM[col];
    // Hausregel "Spalten-Wette": eigene gewettete Spalte zaehlt doppelt.
    if (this.betColumn === col) value *= COLUMN_BET_MULTIPLIER;
    this.columnAward[col] = value;
  }

  strikeColumnTop(col) {
    this.columnTopStruck[col] = true;
  }

  // PvP: einen zuvor gestrichenen Spalten-Oberwert wieder freigeben.
  unstrikeColumnTop(col) {
    this.columnTopStruck[col] = false;
  }

  // --- Farben --------------------------------------------------------------
  colorMarkedCount(color) {
    let n = 0;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.marks[r][c] && GRID[r][c] === color) n++;
      }
    }
    return n;
  }

  isColorComplete(color) {
    return this.colorMarkedCount(color) === COLOR_COUNTS[color];
  }

  newlyCompletedColors(cells) {
    const colors = new Set(cells.map(([r, c]) => GRID[r][c]));
    const result = [];
    for (const color of colors) {
      if (this.colorAward[color] === undefined && this.isColorComplete(color)) {
        result.push(color);
      }
    }
    return result;
  }

  awardColor(color, value) {
    this.colorAward[color] = value;
  }

  strikeColorFirst(color) {
    this.colorFirstStruck[color] = true;
  }

  // PvP: einen zuvor gestrichenen Farb-Erstbonus wieder freigeben.
  unstrikeColorFirst(color) {
    this.colorFirstStruck[color] = false;
  }

  completedColorCount() {
    return Object.keys(this.colorAward).length;
  }

  // Anzahl der vollstaendig angekreuzten Farben (grid-basiert, unabhaengig von der Wertung).
  completedColorGridCount() {
    return COLOR_ORDER.filter((c) => this.isColorComplete(c)).length;
  }

  // Sind alle Spalten geschlossen?
  allColumnsComplete() {
    for (let c = 0; c < GRID_COLS; c++) {
      if (!this.isColumnComplete(c)) return false;
    }
    return true;
  }

  // --- Sterne --------------------------------------------------------------
  uncrossedStars() {
    let n = 0;
    for (const [r, c] of STARS) {
      if (!this.marks[r][c]) n++;
    }
    return n;
  }

  // --- Endwertung ----------------------------------------------------------
  computeScore() {
    const bonus = Object.values(this.colorAward).reduce((a, b) => a + b, 0);
    const columns = this.columnAward.reduce((a, v) => a + (v || 0), 0);
    const jokersRemaining = this.jokersRemaining();
    const jokerBonus = jokersRemaining * UNUSED_JOKER_BONUS;
    const uncrossedStars = this.uncrossedStars();
    const starPenalty = uncrossedStars * this.starPenalty;
    const passPenalty = this.passes * this.passPenalty;

    // Hausregel "Spalten-Wette": nur zur Anzeige - der durch die Verdopplung
    // entstandene Zusatzwert (steckt bereits vollstaendig in "columns").
    let betBonus = 0;
    if (this.betColumn !== null && this.columnAward[this.betColumn] !== null) {
      betBonus = this.columnAward[this.betColumn] / COLUMN_BET_MULTIPLIER;
    }

    // Hausregel "Geheimziel-Karten": Bonus obendrauf, falls das zugeloste Ziel
    // bis Spielende erfuellt ist.
    const goalAchieved = !!(this.secretGoal && this.secretGoal.check(this));
    const goalBonus = goalAchieved ? this.secretGoal.bonus : 0;

    const total = bonus + columns + jokerBonus - starPenalty - passPenalty + goalBonus;
    return {
      bonus,
      columns,
      jokerBonus,
      jokersRemaining,
      starPenalty,
      uncrossedStars,
      passPenalty,
      passes: this.passes,
      betColumn: this.betColumn,
      betBonus,
      secretGoal: this.secretGoal,
      goalAchieved,
      goalBonus,
      total,
    };
  }
}

export { hasStar, COLOR_ORDER };
