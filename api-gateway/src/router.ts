import express from "express";
import type { Express, Router } from "express";
import jobRouter from "./routers/jobRouter";


const router: Router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello from Express + TypeScript + Bun!");
});

router.use("/jobs", jobRouter);

export default router as Router;