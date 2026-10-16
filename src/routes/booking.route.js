import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { book } from "../controllers/booking.controller.js"

const router = express.Router();
router.get("/health", authMiddleware, book);
router.post("/book", authMiddleware, book)

export default router;