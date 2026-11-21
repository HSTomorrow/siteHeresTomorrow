import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleGetNews } from "./routes/news";
import { materiaisRouter } from "./routes/materiais";
import { questoesRouter } from "./routes/questoes-ia";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.get("/api/news", handleGetNews);

  // Materiais de estudo enviados pelo administrador
  app.use(materiaisRouter());

  // Questões geradas por IA ("Reprocessamento" em /prova)
  app.use(questoesRouter());

  return app;
}
