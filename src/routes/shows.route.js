import express from "express"
import {createShow} from "../controllers/shows.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();


router.post("/create", authMiddleware, createShow);

export default router;