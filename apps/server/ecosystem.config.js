module.exports = {
  apps: [
    {
      name: 'praising-server',
      port: '3000',
      exec_mode: 'cluster',
      cron_restart: '50 23 * * *',
      instances: 'max',
      script: './dist/main.js',
    },
  ],
};
