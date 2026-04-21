# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).


Frontend — Local Development Setup

Note: The frontend is not yet connected to Docker. Follow the steps below to run it locally.


Getting Started
1. Navigate to the frontend directory
bashcd application/frontend
2. Install dependencies
bashnpm install
3. Start the development server
bashnpm run dev
The app will be available at http://localhost:5173 

Troubleshooting
Permission denied on startup?
bashchmod +x node_modules/.bin/vite
Still having issues? Try a clean install:
bashrm -rf node_modules
npm install
npm run dev

Notes

Run npm install any time new packages are added to package.json
Docker integration is coming — this manual setup is temporary
