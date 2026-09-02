import "dotenv/config"
import express from "express"
import authRoute from "./routes/auth.route.js"
import organizerRoute from "./routes/organizer.route.js"
import { authMiddleware } from "./middlewares/auth.middleware.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded());

//Routing Middlewares
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/organizer", organizerRoute)

app.get("/", (req, res) => {
    res.send("Hermit is working...")
});





const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
    console.log(`Server is running on port ${PORT}`);
})


