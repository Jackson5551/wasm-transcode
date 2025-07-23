import express, { Express, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import * as http from "node:http";
import { log } from "./Logger";
import router from "./router";
import { Server } from "socket.io";
import {WorkerManager} from "./Services/WorkerManager";
import './crons'

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

app.use(cors());

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

const io = new Server(server, {
  cors: {
    origin: '*', // Adjust this to match your frontend origin in production
  },
});

// Initialize the WorkerManager with the Socket.IO server
export const manager = new WorkerManager(io);

app.get('/workers', (req, res) => {
  res.json(manager.getActiveWorkers());
});

server.listen(port, async () => {
  log("cyan", 'SERVER', 'Server listening on port ' + port);
});