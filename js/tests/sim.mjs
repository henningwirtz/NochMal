// Headless-Smoke-Test: spielt komplette KI-Partien durch (ohne DOM) und prueft,
// dass sie ohne Fehler terminieren. `node js/tests/sim.mjs`
import { Game } from '../core/game.js';
import { chooseMove } from '../core/ai.js';

function playGame(nPlayers, solo = false) {
  const cfgs = Array.from({ length: nPlayers }, (_, i) => ({ name: 'P' + i, isHuman: false }));
  const game = new Game(cfgs, { soloMode: solo });
  let rounds = 0;
  const limit = solo ? 30 : 5000;
  while (rounds < limit && !(solo ? rounds >= 30 : game.finished)) {
    rounds++;
    game.beginRound();
    while (!game.isRoundComplete()) {
      const idx = game.currentChooserIndex();
      const move = chooseMove(game.players[idx].sheet, game.availablePool(idx));
      if (!move) game.submitPass(idx);
      else game.submitChoice(idx, move);
    }
    game.resolveRound();
  }
  const scores = game.finalScores().map((r) => `${r.player.name}:${r.total}`).join('  ');
  return { finished: game.finished, rounds, scores };
}

let allOk = true;
for (const n of [2, 3, 4, 6]) {
  for (let i = 0; i < 5; i++) {
    const r = playGame(n);
    const ok = r.finished && r.rounds < 5000;
    allOk = allOk && ok;
    if (!ok || i === 0) console.log(`${n} Spieler #${i}: finished=${r.finished} rounds=${r.rounds} | ${r.scores}`);
  }
}
// Solo
for (let i = 0; i < 3; i++) {
  const r = playGame(1, true);
  console.log(`Solo #${i}: rounds=${r.rounds} | ${r.scores}`);
  allOk = allOk && r.rounds === 30;
}

console.log(allOk ? '\nALLE SMOKE-TESTS OK' : '\nFEHLER in Smoke-Tests');
process.exit(allOk ? 0 : 1);
