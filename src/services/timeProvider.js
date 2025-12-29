export function nowMs(req) {
  if (process.env.TEST_MODE === '1' && req.headers['x-test-now-ms']) {
    const n = Number(req.headers['x-test-now-ms']);
    if (!Number.isNaN(n)) return n;
  }
  return Date.now();
}
