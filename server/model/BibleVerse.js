import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const BibleVerse = sequelize.define(
    "BibleVerse",
    {
        version: {
            type: DataTypes.STRING,
            allowNull: false,
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
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "bible_verses", // Ensure this matches your actual table
        timestamps: false,
        primaryKey: {
            fields: ["version", "book_id", "chapter", "verse"],
        },
    }
);

export default BibleVerse;
