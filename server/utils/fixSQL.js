import fs from "fs";
import path from "path";

const sqlFolderPath = path.resolve("./data"); // Change this if your files are elsewhere

function fixSqlSyntax(content) {
    return content
        .replace(/chapterint/gi, "chapter int") // Fix 'chapterint' issue
        .replace(/notnull/gi, "NOT NULL") // Fix 'notnull' issue
        .replace(/\bPRIMARY KEY \(book_id,chapter,verse\)/gi, "PRIMARY KEY (book_id, chapter, verse)"); // Ensure correct key format
}

function processSqlFiles() {
    try {
        const sqlFiles = fs.readdirSync(sqlFolderPath).filter((file) => file.endsWith(".sql"));

        if (sqlFiles.length === 0) {
            console.log("❌ No SQL files found.");
            return;
        }

        console.log(`📂 Found ${sqlFiles.length} SQL files. Fixing syntax...`);

        for (const file of sqlFiles) {
            const filePath = path.join(sqlFolderPath, file);
            let content = fs.readFileSync(filePath, "utf-8");

            const fixedContent = fixSqlSyntax(content);

            if (fixedContent !== content) {
                fs.writeFileSync(filePath, fixedContent, "utf-8");
                console.log(`✅ Fixed: ${file}`);
            } else {
                console.log(`👌 No changes needed: ${file}`);
            }
        }

        console.log("🎉 SQL syntax fixes applied successfully!");
    } catch (error) {
        console.error("❌ Error processing SQL files:", error);
    }
}

// Run the script
processSqlFiles();
