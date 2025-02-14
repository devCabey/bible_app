import express from "express";
import cors from "cors";
import bibleRoutes from "./routes/bibleRoutes.js";
import sequelize from "./model/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", bibleRoutes);

const PORT = process.env.PORT || 5500;

// Start process
// sequelize
//     .authenticate()
//     .then(() => {
//         console.log("✅ Connected to database.");
//         return sequelize.sync();
//     })
//     .catch((error) => {
//         console.error("❌ Database connection error:", error);
//         process.exit(1);
//     });

sequelize.sync().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});
