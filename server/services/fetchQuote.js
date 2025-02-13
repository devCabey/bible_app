import BibleVerse from "../model/bibleVerseModel";

async function fetchBibleQuote(reference) {
    const [book, chapter, verse] = reference.split(/\s+|:/);
    const result = await BibleVerse.findOne({
        where: { book, chapter, verse },
    });
    return result?.text || "Verse not found";
}

export default fetchBibleQuote;
