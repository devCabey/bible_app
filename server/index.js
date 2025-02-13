import express from "express";
import sequelize from "./config/database";
import { extractBibleReference } from "./utils/extractVerse";

const app = express();
app.use(express.json());

app.post("/get-verse", async (req, res) => {
    const { text, translation = "akjv" } = req.body;

    try {
        const reference = await extractBibleReference(text); // Use AI to extract Bible reference

        if (!reference) {
            return res.json({ message: "No Bible reference found." });
        }

        const { book, chapter, verse } = reference;
        const [results] = await sequelize.query(`SELECT * FROM ${translation} WHERE book = ? AND chapter = ? AND verse = ?`, { replacements: [book, chapter, verse] });

        if (results.length === 0) {
            return res.status(404).json({ message: "Verse not found." });
        }

        res.json(results[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
