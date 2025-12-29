const DEFAULT_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export function startHealthCheckScheduler(
  intervalMs = Number(process.env.HEALTH_SCHEDULER_INTERVAL_MS) ||
    DEFAULT_INTERVAL_MS
) {
  const envBase =
    process.env.frontendbaseurl ||
    process.env.FRONTEND_BASE_URL ||
    process.env.FRONTENDBASEURL;

  if (!envBase) {
    console.error(
      '[health-scheduler] No frontend base URL found in env; scheduler disabled.'
    );
    return () => {};
  }

  const base = envBase.replace(/\/+$/, '');
  const url = `${base}/api/healthz`;
  let timerId;

  async function check() {
    try {
      const res = await fetch(url);
      console.log(
        `[health-scheduler] ${new Date().toISOString()} ${url} -> ${res.status}`
      );
    } catch (err) {
      console.error(
        `[health-scheduler] ${new Date().toISOString()} error calling ${url}:`,
        err.message || err
      );
    }
  }

  check();
  timerId = setInterval(check, intervalMs);

  return () => {
    if (timerId) clearInterval(timerId);
  };
}

export default startHealthCheckScheduler;
