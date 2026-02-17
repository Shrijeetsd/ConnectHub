export default {
  start: async () => console.log('[Mock] BackgroundService started'),
  stop: async () => console.log('[Mock] BackgroundService stopped'),
  isRunning: () => false,
};
