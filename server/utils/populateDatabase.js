import fs from "fs";
import path from "path";
import { sequelize } from "../models/index.js";

async function executeSQLFile(filePath) {
    try {
        const sql = fs.readFileSync(filePath, "utf8");
        await sequelize.query(sql);
        console.log(`Executed ${filePath}`);
    } catch (error) {
        console.error(`Error executing ${filePath}:`, error);
    }
}

async function run() {
    const sqlDir = path.join(__dirname, "sql_files"); // Folder with SQL files
    const files = fs.readdirSync(sqlDir).filter((file) => file.endsWith(".sql"));

    for (const file of files) {
        await executeSQLFile(path.join(sqlDir, file));
    }

    console.log("Database population complete.");
    process.exit();
}

run();
