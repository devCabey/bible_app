async function extractBibleReference(text) {
    return text.match(/\b(?:John|Matthew|Luke|Mark|Romans|Genesis|Psalms|Proverbs)\s+\d+:\d+\b/)?.[0];
}

export default extractBibleReference;
