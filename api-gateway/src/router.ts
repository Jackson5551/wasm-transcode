import express from "express";
import type { Express, Router } from "express";


const router: Router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello from Express + TypeScript + Bun!");
});

export default router as Router;