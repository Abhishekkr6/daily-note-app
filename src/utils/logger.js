// utils/logger.js
export function logEvent(event, meta = {}) {
  // In production, send to a log aggregator (Datadog, Sentry, etc.)
  // Here, just print to console
  console.log(`[${new Date().toISOString()}] [${event}]`, meta);
}

export function logSuspiciousActivity(userId, reason, meta = {}) {
  // Alerting logic can be added here
  console.warn(`[${new Date().toISOString()}] [SUSPICIOUS] User: ${userId} - ${reason}`, meta);
}
