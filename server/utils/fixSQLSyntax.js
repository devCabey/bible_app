import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlDir = path.join(__dirname, "data"); // Adjust to your directory path

function fixSQLSyntax(filePath) {
    let sqlContent = fs.readFileSync(filePath, "utf8");

    // Ensure all text values are enclosed in quotes and escape internal quotes
    sqlContent = sqlContent.replace(/VALUES\s*\((\d+,\s*'[^']+',\s*\d+,\s*\d+,\s*'([^']*)')/g, (match, group1, textValue) => {
        // Escape any single quotes inside the text value
        const fixedTextValue = textValue.replace(/'/g, "''");
        return match.replace(textValue, fixedTextValue);
    });

    // Ensure all lines end correctly with `),`
    sqlContent = sqlContent.replace(/,\s*\n\(\d+,/g, ",\n(");

    // Ensure the last line ends with `;`
    if (!sqlContent.trim().endsWith(";")) {
        sqlContent += ";\n";
    }

    fs.writeFileSync(filePath, sqlContent, "utf8");
    console.log(`✅ Fixed SQL syntax in: ${filePath}`);
}

fs.readdirSync(sqlDir).forEach((file) => {
    if (file.endsWith(".sql")) {
        const filePath = path.join(sqlDir, file);
        fixSQLSyntax(filePath);
    }
});

console.log("✅ All SQL files processed successfully.");
