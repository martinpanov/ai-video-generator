## Start project locally

1. Checkout the `local` branch
2. Start the local dev server by running: `npm run dev:local`
3. If you want to check the database collections run: `npx prisma studio`
5. Start the webhook handler by running: `ngrok http 3000`
6. Start `Docker desktop` program
7. Open the `no-code-architects` project and run: `docker-compose -f docker-compose.local.minio.n8n.yml up -d`