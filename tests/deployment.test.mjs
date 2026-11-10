import { test } from 'node:test';
import assert from 'node:assert/strict';
import { waitForLegacyPages } from '../.github/scripts/wait-for-legacy-pages.mjs';

test('Pages deployment proceeds when no legacy publisher exists', async () => {
  await waitForLegacyPages({ listRuns: async () => [{ path: '.github/workflows/pages.yml', status: 'in_progress' }], sleep: () => assert.fail('Must not wait for itself') });
});
test('Pages deployment waits until the legacy publisher completes', async () => {
  let checks = 0, waits = 0;
  await waitForLegacyPages({ listRuns: async () => [{ path: 'dynamic/pages/pages-build-deployment', status: ++checks < 3 ? 'in_progress' : 'completed' }], sleep: async () => { waits++; } });
  assert.equal(checks, 3); assert.equal(waits, 2);
});
test('a stuck legacy publication prevents an unsafe deployment race', async () => {
  await assert.rejects(waitForLegacyPages({ listRuns: async () => [{ path: 'dynamic/pages/pages-build-deployment', status: 'queued' }], sleep: async () => {}, attempts: 2 }), /did not finish/);
});
