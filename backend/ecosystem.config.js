module.exports = {
  apps : [{
    name: 'europace',
    script: 'dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    ignore_watch : ["static"],
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};