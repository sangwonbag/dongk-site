// A caller can stop waiting without cancelling the request used by other views.
export function waitForRequest(promise, signal) {
  if (!signal) return promise;
  const abortError = () => Object.assign(new Error('aborted'), { name: 'AbortError' });
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise((resolve, reject) => {
    const abort = () => { cleanup(); reject(abortError()); };
    const cleanup = () => signal.removeEventListener('abort', abort);
    signal.addEventListener('abort', abort, { once: true });
    promise.then(value => { cleanup(); resolve(value); }, error => { cleanup(); reject(error); });
  });
}

export function createSharedRequestPool() {
  const inflight = new Map();
  return function run(key, task, signal, timeoutMs = 12000) {
    if (signal?.aborted) return waitForRequest(Promise.resolve(), signal);
    let promise = inflight.get(key);
    if (!promise) {
      const controller = new AbortController();
      let timer;
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(Object.assign(new Error('조회 시간이 초과되었습니다. 다시 시도해 주세요.'), { name: 'TimeoutError' }));
          controller.abort();
        }, timeoutMs);
      });
      promise = Promise.race([Promise.resolve().then(() => task(controller.signal)), timeout])
        .finally(() => {
          clearTimeout(timer);
          if (inflight.get(key) === promise) inflight.delete(key);
        });
      inflight.set(key, promise);
    }
    return waitForRequest(promise, signal);
  };
}
