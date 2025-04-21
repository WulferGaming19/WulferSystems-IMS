import chalk from 'chalk';

function getTimestamp() {
  // Uhrzeit für einen TimeStamp
  const now = new Date();
  return now.toLocaleTimeString('de-DE', { hour12: false });
}

type LogType = 'info' | 'success' | 'warn' | 'error' | 'debug'; // Die Unterschiedlichen Log Arten

const prefixMap: Record<LogType, string> = {
  // definierung der Unterschiedlichen Arten, dessen Farben und text
  info: chalk.blue('ℹ️ INFO'),
  success: chalk.green('✅ SUCCESS'),
  warn: chalk.yellow('⚠️ WARN'),
  error: chalk.red('❌ ERROR'),
  debug: chalk.gray('🐞 DEBUG'),
};

const logLevelPriority: Record<LogType, number> = {
  // Die Verschiedenen Log level
  error: 1,
  warn: 2,
  success: 3,
  info: 4,
  debug: 5,
};

// Minimaler Log-Level je nach Umgebung
const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 3 : 5;

export function log(type: LogType, message: string) {
  const priority = logLevelPriority[type];

  if (priority <= LOG_LEVEL) {
    const timestamp = chalk.gray(`[${getTimestamp()}]`);
    const prefix = prefixMap[type];
    console.log(`${timestamp} ${prefix} ${message}`);
  }
}
