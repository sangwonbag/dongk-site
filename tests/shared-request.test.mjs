import test from 'node:test';
import assert from 'node:assert/strict';
import { createSharedRequestPool } from '../src/utils/sharedRequest.js';

test('StrictMode cancellation does not duplicate or cancel another subscriber', async () => {
  const run = createSharedRequestPool();
  let calls = 0, finish;
  const task = () => { calls++; return new Promise(resolve => { finish = resolve; }); };
  const first = new AbortController();
  const a = run('KCC', task, first.signal);
  const rejected = assert.rejects(a, { name: 'AbortError' });
  first.abort();
  const b = run('KCC', task, new AbortController().signal);
  await Promise.resolve();
  finish(['TS5502P']);
  await rejected;
  assert.deepEqual(await b, ['TS5502P']);
  assert.equal(calls, 1);
});

test('hung requests time out, abort transport, and allow retry', async () => {
  const run = createSharedRequestPool();
  let signal;
  await assert.rejects(run('slow', s => { signal = s; return new Promise(() => {}); }, null, 20), { name: 'TimeoutError' });
  assert.equal(signal.aborted, true);
  assert.equal(await run('slow', () => 42), 42);
});

test('failed requests are not retained and keys do not collide', async () => {
  const run = createSharedRequestPool();
  await assert.rejects(run('a', () => { throw new Error('offline'); }), /offline/);
  assert.deepEqual(await Promise.all([run('a', () => 1), run('b', () => 2)]), [1, 2]);
});
