import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {addVenue} from "../controllers/venue.controller.js"
const router = express.Router();

router.post("/add", authMiddleware, addVenue);

export default router;