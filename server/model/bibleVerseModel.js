import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const BibleVerse = sequelize.define(
    "BibleVerse",
    {
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
        tableName: "bible_verses",
        timestamps: false, // Disable timestamps
    }
);

export default BibleVerse;
