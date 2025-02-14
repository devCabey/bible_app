import sequelize from "../model/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlDir = path.join(__dirname, "data");

async function executeQuery(query) {
    const transaction = await sequelize.transaction();
    try {
        await sequelize.query(query, { transaction });
        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        console.error("❌ Error executing query:", err);
    }
}

async function executeSQLFile(filePath) {
    try {
        const sql = fs.readFileSync(filePath, "utf-8");

        const parts = sql.split("\n\n");

        const statements = parts[0]
            .split("INSERT")
            .map((stmt, index) => {
                if (index > 0) return "INSERT " + stmt.trim();
            })
            .filter((stmt) => stmt?.length > 0);

        for (const stmt of statements) {
            await executeQuery(stmt);
        }

        console.log(`✅ Successfully executed: ${filePath}`);
    } catch (error) {
        console.error(`❌ Error executing ${filePath}:`, error);
    }
}

async function populateDatabase() {
    const transaction = await sequelize.transaction(); // Start transaction

    try {
        const sqlFiles = fs.readdirSync(sqlDir).filter((file) => file.endsWith(".sql"));

        if (sqlFiles?.length === 0) {
            console.log("⚠️ No SQL files found!");
            return;
        }

        console.log("⏳ Populating database...");
        for (const file of sqlFiles) await executeSQLFile(path.join(sqlDir, file), transaction);

        await transaction.commit(); // Commit only after all queries succeed
        console.log("🎉 Database successfully populated!");
    } catch (error) {
        await transaction.rollback(); // Rollback on failure
        console.error("❌ Database population error:", error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

populateDatabase();
