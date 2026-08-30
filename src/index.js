import "dotenv/config"
import express from "express"

const app = express();

app.get("/", (req, res) => {
    res.send("Hermit is working...")
});

const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
    console.log(`Server is running on port ${PORT}`);
})

