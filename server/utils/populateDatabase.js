import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import sequelize from "../model/index.js";

dotenv.config();

const sqlFolderPath = path.resolve("./data");

async function populateDatabase() {
    try {
        // Read all .sql files in the folder
        const sqlFiles = fs.readdirSync(sqlFolderPath).filter((file) => file.endsWith(".sql"));

        if (sqlFiles.length === 0) {
            console.log("❌ No SQL files found in the folder.");
            return;
        }

        console.log(`📂 Found ${sqlFiles.length} SQL files. Executing in order...`);

        for (const file of sqlFiles) {
            const filePath = path.join(sqlFolderPath, file);
            const sql = fs.readFileSync(filePath, "utf-8");

            console.log(`🚀 Executing: ${file}`);
            await sequelize.query(sql, { raw: true });
            console.log(`✅ Completed: ${file}`);
        }

        console.log("🎉 All SQL files executed successfully!");
    } catch (error) {
        console.error("❌ Error executing SQL files:", error);
    } finally {
        await sequelize.close();
    }
}

// Run the import
populateDatabase();
