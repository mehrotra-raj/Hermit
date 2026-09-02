import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { createOrganizer } from "../controllers/organizer.controller.js";
const router = express.Router();

router.post("/signup", authMiddleware, createOrganizer)

export default router;  