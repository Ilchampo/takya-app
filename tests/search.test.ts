import assert from 'node:assert/strict';
import test from 'node:test';
import { createPlateSearch } from '../src/lib/services/search.service.ts';
import { abortError } from '../src/lib/utils/service.utils.ts';
import config from '../src/lib/configs/app.config.ts';
import type * as types from '../src/lib/types.ts';

const reply = (plate: string) => ({ plate, data: { numeroPlaca: plate }, diagnostics: {
  stage: 'lookup' as const, status: 200, contentType: 'application/json', elapsedMs: 1,
} });

test('one source becomes readable while its sibling is still pending', async () => {
  let release!: () => void;
  let received!: () => void;
  const firstReady = new Promise<void>(resolve => { received = resolve; });
  const pending = new Promise<void>(resolve => { release = resolve; });
  const updates: types.LookupProgress[] = [];
  const saved: types.LookupResult[] = [];
  const search = createPlateSearch({
    getCachedLookup: async () => null,
    saveLookup: async result => { saved.push(result); },
    vehicle: async plate => reply(plate),
    fiscalia: async plate => { await pending; return reply(plate); },
  });
  const running = search('PBC1234', { onUpdate: state => {
    updates.push(state);
    if (state.sri.status === 'success') received();
  } });
  await firstReady;
  assert.equal(updates.at(-1)?.sri.status, 'success');
  assert.equal(updates.at(-1)?.fiscalia.status, 'loading');
  assert.equal(saved.length, 0);
  release();
  await running;
  assert.equal(saved.length, 1);
  assert.equal(saved[0]?.fiscalia.status, 'success');
});

test('exhausts configured retries only for the failing source, then shows unavailable', async () => {
  let sriCalls = 0;
  let fiscaliaCalls = 0;
  const attempts: number[] = [];
  const waits: number[] = [];
  const search = createPlateSearch({
    getCachedLookup: async () => null,
    saveLookup: async () => assert.fail('partial results must not be cached'),
    vehicle: async plate => { sriCalls++; return reply(plate); },
    fiscalia: async () => { fiscaliaCalls++; throw new Error('unavailable'); },
    wait: async ms => { waits.push(ms); },
  });
  const result = await search('PBC1234', { onUpdate: state => {
    if (state.fiscalia.status === 'loading' && !attempts.includes(state.fiscalia.attempt)) {
      attempts.push(state.fiscalia.attempt);
    }
    if (state.fiscalia.status === 'error') assert.equal(fiscaliaCalls, config.service.maxRetries + 1);
  } });
  assert.equal(sriCalls, 1);
  assert.equal(fiscaliaCalls, config.service.maxRetries + 1);
  assert.deepEqual(attempts, Array.from({ length: config.service.maxRetries + 1 }, (_, index) => index + 1));
  assert.deepEqual(waits, Array.from({ length: config.service.maxRetries }, (_, index) => 500 * 2 ** index));
  assert.equal(result.sri.status, 'success');
  assert.equal(result.fiscalia.status, 'error');
});

test('stops retries immediately after recovery', async () => {
  let calls = 0;
  const search = createPlateSearch({
    getCachedLookup: async () => null, saveLookup: async () => {},
    vehicle: async plate => reply(plate),
    fiscalia: async plate => { if (++calls < 3) throw new Error('offline'); return reply(plate); },
    wait: async () => {},
  });
  const result = await search('PBC1234', { onUpdate: () => {} });
  assert.equal(calls, 3);
  assert.equal(result.fiscalia.status, 'success');
});

test('cache hits publish both sources without making requests', async () => {
  const cached: types.LookupResult = {
    plate: 'PBC1234', fromCache: true, fetchedAt: 123,
    sri: { status: 'success', data: {} }, fiscalia: { status: 'success', data: {} },
  };
  const search = createPlateSearch({
    getCachedLookup: async plate => { assert.equal(plate, 'PBC1234'); return cached; },
    saveLookup: async () => assert.fail('do not rewrite the cache or its age'),
    vehicle: async () => assert.fail('must not fetch'), fiscalia: async () => assert.fail('must not fetch'),
  });
  const updates: types.LookupProgress[] = [];
  assert.equal(await search(' pbc1234 ', { onUpdate: state => updates.push(state) }), cached);
  assert.equal(updates.at(-1), cached);
});

test('legacy spelling uses the padded cache key before either service is called', async () => {
  const search = createPlateSearch({
    getCachedLookup: async plate => {
      assert.equal(plate, 'ABC0123');
      return { plate, fromCache: true, fetchedAt: 123,
        sri: { status: 'success', data: {} }, fiscalia: { status: 'success', data: {} } };
    },
    saveLookup: async () => assert.fail('must not change cached timestamp'),
    vehicle: async () => assert.fail('must not fetch'), fiscalia: async () => assert.fail('must not fetch'),
  });
  const result = await search('ABC-123', { onUpdate: () => {} });
  assert.equal(result.plate, 'ABC0123');
});

test('cancellation during retry backoff does not publish stale data or start another request', async () => {
  const controller = new AbortController();
  let calls = 0;
  let updateCount = 0;
  let countAtCancel = 0;
  const search = createPlateSearch({
    getCachedLookup: async () => null,
    saveLookup: async () => assert.fail('must not save after cancellation'),
    vehicle: async plate => reply(plate),
    fiscalia: async () => { calls++; throw new Error('offline'); },
    wait: async () => { countAtCancel = updateCount; controller.abort(); throw abortError(); },
  });
  await assert.rejects(search('PBC1234', {
    signal: controller.signal, onUpdate: () => { updateCount++; },
  }), { name: 'AbortError' });
  assert.equal(calls, 1);
  assert.equal(updateCount, countAtCancel);
});

test('late source responses after cancellation are ignored', async () => {
  const controller = new AbortController();
  let release!: () => void;
  let started!: () => void;
  const inFlight = new Promise<void>(resolve => { started = resolve; });
  const pending = new Promise<void>(resolve => { release = resolve; });
  const updates: types.LookupProgress[] = [];
  const search = createPlateSearch({
    getCachedLookup: async () => null,
    saveLookup: async () => assert.fail('must not save'),
    vehicle: async plate => { started(); await pending; return reply(plate); },
    fiscalia: async plate => { await pending; return reply(plate); },
  });
  const running = search('PBC1234', { signal: controller.signal, onUpdate: state => updates.push(state) });
  await inFlight;
  const count = updates.length;
  controller.abort();
  release();
  await assert.rejects(running, { name: 'AbortError' });
  assert.equal(updates.length, count);
});
