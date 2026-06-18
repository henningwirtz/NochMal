// ============================================================================
// core/dice.js
// Wuerfelmodell und Wurf-Logik.
// ============================================================================

import { COLOR_DIE_FACES, NUMBER_DIE_FACES } from './constants.js';

function randomFace(faces) {
  return faces[Math.floor(Math.random() * faces.length)];
}

// Wirft alle Wuerfel. Standard: 3 Farb- + 3 Zahlenwuerfel. Solo: 2 + 2.
// Rueckgabe: { colorDice: [{id, face}], numberDice: [{id, face}] }
export function rollAll(soloMode = false) {
  const count = soloMode ? 2 : 3;
  const colorDice = [];
  const numberDice = [];
  for (let i = 0; i < count; i++) {
    colorDice.push({ id: `c${i}`, face: randomFace(COLOR_DIE_FACES) });
    numberDice.push({ id: `n${i}`, face: randomFace(NUMBER_DIE_FACES) });
  }
  return { colorDice, numberDice };
}

// Liefert die eindeutigen verfuegbaren Farb- bzw. Zahlenwerte aus einem Pool.
export function uniqueFaces(dice) {
  return [...new Set(dice.map((d) => d.face))];
}
