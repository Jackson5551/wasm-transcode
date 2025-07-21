import express, {Router, Request, Response} from "express";
import {File} from "../Models";
import FileController from "../Controllers/FileController";

const router: Router = express.Router();

//@ts-ignore
router.get('/', FileController.index);

export default router as Router;