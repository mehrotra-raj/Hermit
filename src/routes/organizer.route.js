import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { createOrganizer } from "../controllers/organizer.controller.js";
const router = express.Router();

/*
For simplicity, we allow any and all users who are authenticated, to hit the 
"/api/v1/organizers" route and become an organizer
The user is then an organizer and thus allowed to host/create shows
 */

router.post("/signup", authMiddleware, createOrganizer);

export default router;  