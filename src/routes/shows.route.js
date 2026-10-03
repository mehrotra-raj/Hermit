import express from "express"
import {createShow, seatMap} from "../controllers/shows.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();


router.post("/create", authMiddleware, createShow);
router.get("/:id/seats", authMiddleware, seatMap);

export default router;