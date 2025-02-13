import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
    port: Number(process.env.DB_PORT) || 5432,
    dialectOptions:
        process.env.NODE_ENV === "production"
            ? {
                  ssl: {
                      require: true,
                      rejectUnauthorized: false,
                  },
              }
            : {},
});

export default sequelize;
