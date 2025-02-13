import sequelize from "../model/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clearDatabase = async () => {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    await sequelize.query("DROP TABLE IF EXISTS bible_verses");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
};

const populateDatabase = async () => {
    try {
        await clearDatabase();

        const sqlPath = path.join(__dirname, "./data");
        const sql = fs.readFileSync(sqlPath, "utf8");
        await sequelize.query(sql);

        console.log("✅ Database populated successfully!");
    } catch (error) {
        console.error("Database population error:", error);
    } finally {
        process.exit(0);
    }
};

sequelize.sync().then(populateDatabase);
