// Node-Runner fuer die Testsuite: `npm test` oder `node js/tests/node-runner.mjs`.
import { runTests } from './testsuite.js';

const results = runTests();
let passed = 0;
for (const r of results) {
  if (r.ok) { passed++; console.log(`✓ ${r.name}`); }
  else { console.log(`✗ ${r.name} — ${r.error}`); }
}
console.log(`\n${passed}/${results.length} Tests bestanden`);
process.exit(passed === results.length ? 0 : 1);
