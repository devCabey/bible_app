import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const BibleVerse = sequelize.define(
    "BibleVerse",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        book_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        book: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        chapter: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        verse: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: "bible_verses", // Ensure this matches your actual table
        indexes: [
            {
                unique: true,
                fields: ["id"], // Ensures uniqueness per verse
            },
            {
                fields: ["id"], // Speeds up queries filtering by book
            },
        ],
    }
);

export default BibleVerse;
