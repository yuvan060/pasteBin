const DEFAULT_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function getBaseUrlFromEnv(port) {
  const envBase =
    process.env.frontendbaseurl ||
    process.env.FRONTEND_BASE_URL ||
    process.env.FRONTENDBASEURL;
  if (!envBase) return `http://localhost:${port}`;

  let base = envBase.replace(/\/+$|\/+$/g, "");

  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(base)) {
    if (base.startsWith("/")) base = `http://localhost:${port}${base}`;
    else base = `http://${base}`;
  }

  return base.replace(/\/+$/, "");
}

export function startHealthCheckScheduler(
  port,
  intervalMs = Number(process.env.HEALTH_SCHEDULER_INTERVAL_MS) ||
    DEFAULT_INTERVAL_MS
) {
  const base = getBaseUrlFromEnv(port);
  const url = `${base.replace(/\/+$/, "")}/api/healthz`;
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
