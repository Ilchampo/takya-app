/// <reference types="node" />
import assert from 'node:assert/strict';
import test from 'node:test';

import config from '../src/lib/configs/app.config.ts';
import {
  abortError,
  retryBackoffMs,
  serviceWrapper,
  ServiceTimeoutError,
} from '../src/lib/utils/service.utils.ts';

test('returns on the first successful attempt', async () => {
  let calls = 0;
  const attempts: number[] = [];

  const result = await serviceWrapper(async () => {
    calls += 1;
    return 'ok';
  }, {
    maxRetries: 3,
    onAttempt: (attempt) => { attempts.push(attempt); },
    wait: async () => assert.fail('must not wait after a success'),
  });

  assert.equal(result, 'ok');
  assert.equal(calls, 1);
  assert.deepEqual(attempts, [1]);
});

test('retries failed attempts with exponential backoff, then returns', async () => {
  let calls = 0;
  const attempts: number[] = [];
  const waits: number[] = [];

  const result = await serviceWrapper(async () => {
    calls += 1;
    if (calls < 3) throw new Error(`offline ${calls}`);
    return 'recovered';
  }, {
    maxRetries: 3,
    onAttempt: (attempt) => { attempts.push(attempt); },
    wait: async (ms) => { waits.push(ms); },
  });

  assert.equal(result, 'recovered');
  assert.equal(calls, 3);
  assert.deepEqual(attempts, [1, 2, 3]);
  assert.deepEqual(waits, [retryBackoffMs(2), retryBackoffMs(3)]);
});

test('throws the last error after the initial attempt plus maxRetries', async () => {
  let calls = 0;

  await assert.rejects(
    serviceWrapper(async () => {
      calls += 1;
      throw new Error(`unavailable ${calls}`);
    }, {
      maxRetries: 3,
      wait: async () => {},
    }),
    { message: 'unavailable 4' },
  );

  assert.equal(calls, 4);
});

test('times out an attempt even if the request ignores abort', async () => {
  await assert.rejects(
    serviceWrapper(async () => new Promise(() => {}), {
      timeout: 15,
      maxRetries: 0,
    }),
    (error: unknown) => error instanceof ServiceTimeoutError,
  );
});

test('retries timeouts and aborts the in-flight signal', async () => {
  const signals: AbortSignal[] = [];
  let calls = 0;

  await assert.rejects(
    serviceWrapper(async (signal) => {
      calls += 1;
      signals.push(signal);
      return new Promise(() => {});
    }, {
      timeout: 15,
      maxRetries: 1,
      wait: async () => {},
    }),
    (error: unknown) => error instanceof ServiceTimeoutError,
  );

  assert.equal(calls, 2);
  assert.equal(signals[0]?.aborted, true);
  assert.equal(signals[1]?.aborted, true);
  assert.notEqual(signals[0], signals[1]);
});

test('caller cancellation does not retry', async () => {
  const controller = new AbortController();
  let calls = 0;

  const running = serviceWrapper(async () => {
    calls += 1;
    controller.abort();
    throw abortError();
  }, {
    signal: controller.signal,
    maxRetries: 3,
    wait: async () => assert.fail('must not wait after cancellation'),
  });

  await assert.rejects(running, { name: 'AbortError' });
  assert.equal(calls, 1);
});

test('cancellation during retry backoff does not start another request', async () => {
  const controller = new AbortController();
  let calls = 0;

  await assert.rejects(
    serviceWrapper(async () => {
      calls += 1;
      throw new Error('offline');
    }, {
      signal: controller.signal,
      maxRetries: 3,
      wait: async () => {
        controller.abort();
        throw abortError();
      },
    }),
    { name: 'AbortError' },
  );

  assert.equal(calls, 1);
});

test('defaults timeout and retries to the service config', async () => {
  assert.equal(config.service.timeout, 10_000);
  assert.equal(config.service.maxRetries, 5);

  let calls = 0;
  const waits: number[] = [];

  await assert.rejects(
    serviceWrapper(async () => {
      calls += 1;
      throw new Error('offline');
    }, {
      wait: async (ms) => { waits.push(ms); },
    }),
    { message: 'offline' },
  );

  assert.equal(calls, config.service.maxRetries + 1);
  assert.deepEqual(
    waits,
    Array.from({ length: config.service.maxRetries }, (_, index) => retryBackoffMs(index + 2)),
  );
});
