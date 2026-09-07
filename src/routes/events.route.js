import express from "express"
import { fetchAllEvents, fetchVenuesWithShows } from "../controllers/events.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", authMiddleware, fetchAllEvents);
router.get("/:id/shows", authMiddleware, fetchVenuesWithShows);

export default router;