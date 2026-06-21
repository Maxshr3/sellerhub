import express from "express";
import cors from "cors";
import routes from "./routes";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api", routes);

  app.use(notFoundMiddleware);

  return app;
}