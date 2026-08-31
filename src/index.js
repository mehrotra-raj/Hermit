import "dotenv/config"
import express from "express"
import authRoute from "./routes/auth.route.js"

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use("/auth", authRoute);


app.get("/", (req, res) => {
    res.send("Hermit is working...")
});


const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
    console.log(`Server is running on port ${PORT}`);
})


