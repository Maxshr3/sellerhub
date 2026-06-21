import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`SellerHUB backend started on port ${env.port}`);
  console.log(`Health check: http://localhost:${env.port}/api/health`);
});