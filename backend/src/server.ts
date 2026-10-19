import { createApp } from './app.js';
import { config, isSupabaseConfigured } from './config/index.js';

const app = createApp();

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║          ClusterHub REST API              ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log(`  ► Local:    http://localhost:${config.port}`);
  console.log(`  ► Health:   http://localhost:${config.port}/api/health`);
  console.log(`  ► Mode:     ${isSupabaseConfigured() ? '✅ Supabase PostgreSQL' : '⚡ In-memory (no Supabase credentials)'}`);
  console.log(`  ► Env:      ${config.nodeEnv}`);
  console.log(`  ► Origins:  ${config.frontendOrigins.join(', ')}`);
  console.log('');
});

// Graceful shutdown
function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  // Force close after 10s
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});
