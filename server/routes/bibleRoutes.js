import express from "express";
import BibleVerse from "../model/BibleVerse.js";
import { extractBibleReference } from "../utils/extractVerse.js";

const router = express.Router();

router.post("/transcribe", async (req, res) => {
    try {
        const text = req.body.transcription;

        const reference = await extractBibleReference(text);

        if (reference === "None") {
            return res.json({ message: "No Bible reference found." });
        }

        const [book, chapter, verse] = reference.split(" ");
        const me = await BibleVerse.findAll();
        console.log(me);
        // const result = await BibleVerse.findOne({ where: { book, chapter, verse } });

        res.json(result ? result : { message: "Verse not found." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
