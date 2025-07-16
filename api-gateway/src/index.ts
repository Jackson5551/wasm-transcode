import express, { Express, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import * as http from "node:http";
import { log } from "./Logger";
import router from "./router";
import { Server as SocketServer } from "socket.io";
import {WorkerManager} from "./Services/WorkerManager";

const app: Express = express();
const port = process.env.PORT || 8900;

// ────────────────────────────────────────────────────────────────────────────────
// Middleware Configuration
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Body parser middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * This tells Express to treat `X-Forwarded-For` headers as reliable and use them for `req.ip`
 */
app.set('trust proxy', true);

/**
 * Session and cookie management
 */
app.use(session({
  secret: "secretcode-pg",
  resave: false,
  saveUninitialized: true,
}));
app.use(cookieParser());

app.use("/api", router);

const server = http.createServer(app);

const workerManager = new WorkerManager(server);

app.get('/workers', (req, res) => {
  res.json(workerManager.getActiveWorkers());
});

server.listen(port, async () => {
  log("cyan", 'SERVER', 'Server listening on port ' + port);
});