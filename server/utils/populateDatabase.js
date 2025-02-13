import sequelize from "../model/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlDir = path.join(__dirname, "data");

async function executeSQLFile(filePath) {
    try {
        const sql = fs.readFileSync(filePath, "utf-8");

        // Split SQL into individual statements
        const statements = sql
            .split(";")
            .map((stmt) => stmt.trim())
            .filter((stmt) => stmt.length > 0);

        for (const stmt of statements) {
            await sequelize.query(stmt);
        }

        console.log(`✅ Successfully executed: ${filePath}`);
    } catch (error) {
        console.error(`❌ Error executing ${filePath}:`, error);
    }
}

async function resetDatabase() {
    try {
        console.log("⏳ Dropping and recreating all tables...");
        await sequelize.sync({ force: true }); // Drops and recreates all tables
        console.log("✅ Database reset successfully.");
    } catch (error) {
        console.error("❌ Error resetting database:", error);
    } finally {
        await sequelize.close();
    }
}

const populateDatabase = async () => {
    try {
        const sqlFiles = fs.readdirSync(sqlDir).filter((file) => file.endsWith(".sql"));

        if (sqlFiles.length === 0) {
            console.log("⚠️ No SQL files found!");
            return;
        }
        // await resetDatabase();

        for (const file of sqlFiles) {
            await executeSQLFile(path.join(sqlDir, file));
        }

        console.log("🎉 Database successfully populated!");

        console.log("✅ Database populated successfully!");
    } catch (error) {
        console.error("Database population error:", error);
    } finally {
        process.exit(0);
    }
};

sequelize.sync().then(populateDatabase);
