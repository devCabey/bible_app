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
        console.log(parts[0]);
        // Split SQL into individual statements
        const statements = parts[1]
            .split("INSERT")
            .map((stmt) => "INSERT " + stmt.trim())
            .filter((stmt) => stmt.length > 0);
        console.log(statements[2]);

        statements.unshift(parts[0]);

        for (const stmt of statements) {
            await executeQuery(stmt);
        }
        console.log(`✅ Successfully executed: ${filePath}`);
    } catch (error) {
        await transaction.rollback(); // Rollback on failure
        console.error(`❌ Error executing ${filePath}:`, error);
    }
}

async function populateDatabase() {
    try {
        const sqlFiles = fs.readdirSync(sqlDir).filter((file) => file.endsWith(".sql"));

        if (sqlFiles.length === 0) {
            console.log("⚠️ No SQL files found!");
            return;
        }

        console.log("⏳ Populating database...");
        const file = sqlFiles[0];

        // await resetDatabase(); // Uncomment to reset before populating

        // for (const file of sqlFiles) {
        await executeSQLFile(path.join(sqlDir, file));
        // }

        console.log("🎉 Database successfully populated!");
    } catch (error) {
        console.error("❌ Database population error:", error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

populateDatabase();
// Start process
// sequelize
//     .authenticate()
//     .then(() => {
//         console.log("✅ Connected to database.");
//         return sequelize.sync();
//     })
//     .then(populateDatabase)
//     .catch((error) => {
//         console.error("❌ Database connection error:", error);
//         process.exit(1);
//     });
