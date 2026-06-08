/**
 * Logger structuré minimal pour le côté serveur.
 *
 * En développement : sortie lisible dans la console.
 * En production : sortie JSON sur une seule ligne (facilement parsable par
 * les plateformes de logs comme Vercel). Les `debug` sont muets en production.
 *
 * Ne jamais utiliser `console.*` directement dans le code applicatif —
 * passer par ce logger (cf. CLAUDE.md).
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const isProd = process.env.NODE_ENV === "production";

interface LogContext {
  [key: string]: unknown;
}

/**
 * Normalise une erreur inconnue en objet sérialisable.
 */
function serializeError(error: unknown): LogContext {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { error: String(error) };
}

function write(level: LogLevel, message: string, context?: LogContext): void {
  if (level === "debug" && isProd) return;

  if (isProd) {
    const payload = JSON.stringify({
      level,
      message,
      timestamp: new Date().toISOString(),
      ...context,
    });
    // eslint-disable-next-line no-console
    (level === "error" ? console.error : console.log)(payload);
    return;
  }

  const prefix = `[${level.toUpperCase()}]`;
  // eslint-disable-next-line no-console
  const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  fn(prefix, message, context ?? "");
}

export const logger = {
  debug: (message: string, context?: LogContext): void => write("debug", message, context),
  info: (message: string, context?: LogContext): void => write("info", message, context),
  warn: (message: string, context?: LogContext): void => write("warn", message, context),
  /**
   * Log une erreur. Accepte directement un `unknown` capturé dans un catch.
   */
  error: (message: string, error?: unknown, context?: LogContext): void =>
    write("error", message, { ...context, ...(error !== undefined ? serializeError(error) : {}) }),
};
