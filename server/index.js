import express from "express";
import cors from "cors";
import bibleRoutes from "./routes/bibleRoutes.js";
import sequelize from "./model/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", bibleRoutes);

const PORT = 5000;

sequelize.sync().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
