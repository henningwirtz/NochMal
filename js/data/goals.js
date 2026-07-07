// ============================================================================
// data/goals.js
// Pool moeglicher "Geheimziele" (Hausregel Geheimziel-Karten): jedem Spieler
// wird zu Spielbeginn zufaellig eines zugelost (game.js). check(sheet) wertet
// rein den eigenen Blattzustand aus - unabhaengig von anderen Spielern - und
// wird am Spielende (sheet.computeScore) ausgewertet; erfuellt gibt den
// hinterlegten Bonus obendrauf.
// ============================================================================
import { COLOR_ORDER, GRID_COLS, COLOR_BONUS_FIRST } from '../core/constants.js';

export const GOALS = [
  {
    id: 'multicolor',
    label: 'Vielfarbig: in 4+ Farben je 3+ Felder',
    bonus: 3,
    check: (sheet) => COLOR_ORDER.filter((c) => sheet.colorMarkedCount(c) >= 3).length >= 4,
  },
  {
    id: 'starCollector',
    label: 'Sternsammler: höchstens 1 offener Stern',
    bonus: 3,
    check: (sheet) => sheet.uncrossedStars() <= 1,
  },
  {
    id: 'jokerless',
    label: 'Jokerlos: höchstens 1 Joker benutzt',
    bonus: 3,
    check: (sheet) => sheet.jokersUsed <= 1,
  },
  {
    id: 'edges',
    label: 'Randgänger: Spalte A und Spalte O komplett',
    bonus: 4,
    check: (sheet) => sheet.isColumnComplete(0) && sheet.isColumnComplete(GRID_COLS - 1),
  },
  {
    id: 'hoarder',
    label: 'Sparfuchs: mindestens 5 Joker übrig',
    bonus: 3,
    check: (sheet) => sheet.jokersRemaining() >= 5,
  },
  {
    id: 'columns3',
    label: 'Vollblüter: mindestens 3 Spalten komplett',
    bonus: 3,
    check: (sheet) => sheet.columnAward.filter((v) => v !== null).length >= 3,
  },
  {
    id: 'firstColor',
    label: 'Erstkomplettierer: mindestens 1 Farbe als Erster abgeschlossen',
    bonus: 3,
    check: (sheet) => Object.values(sheet.colorAward).some((v) => v === COLOR_BONUS_FIRST),
  },
  {
    id: 'noPass',
    label: 'Kein Aussetzer: nie gepasst',
    bonus: 2,
    check: (sheet) => sheet.passes === 0,
  },
];
