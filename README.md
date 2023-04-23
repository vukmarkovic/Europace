**Server presets**
- node version: 16.17.0
- npm version: 8.15.0

**Deploy to server**

1. Clone repository at any destination.

2. Prepare backend:
   - cd path/to/apikit.europace/backend
   - Open .env.prod file.
   - Fill settings:
     - APP_PORT - application port, 3000 by default;
     - CLIENT_ID - OAuth 2.0 client_id from Vendors;
     - CLIENT_SECRET - OAuth 2.0 client_secret from Vendors;
     - APP_BASE_URL - application backend index URL with protocol and backslash at the end (e.g.: https://europace-dev.app.apik-it.ru/)
     - TASK_PROCESS_COUNT - task limit per cron execution, sets how many tasks will be processed every 10 seconds (1 if not set)
     - DB_HOST - database host, 127.0.0.1 by default;
     - DB_PORT - database port, 3306 by default
     - DB_USERNAME - database username;
     - DB_PASSWORD - database user password;
     - DB_DATABASE - database name.

3. Build backend:
   - cd path/to/apikit.europace/backend
   - npm install
   - npm run build

4. Prepare frontend:
   - cd path/to/apikit.europace/frontend
   - Open .env.production file.
   - Fill settings:
   - REACT_APP_URL - application backend index URL with protocol and backslash at the end (e.g.: https://europace-dev.app.apik-it.ru/)
   
5. Build frontend:
   - cd path/to/apikit.europace/frontend
   - npm install
   - npm run build:prod

6. Upload backend files to the server:
   - dist
   - package.json
   - package-lock.json
   - .env.prod
   - ecosystem.config.js

7. Create `leads` folder on the server.

8. Create `client` folder on the server.

9. Upload frontend files to the server’s `client` folder:
   - build

10. Go to the uploaded files location.

11. Initiate application:
    - npm install —production;
    - npm run seed (executes just once per new app server)

12. Run application (install pm2 first if missing):
    - pm2 start


Restart app: pm2 restart europace

App status: pm2 status

App console logs: pm2 logs