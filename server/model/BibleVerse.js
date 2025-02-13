import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const BibleVerse = sequelize.define(
    "BibleVerse",
    {
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
        tableName: "bible_verses",
        timestamps: false,
    }
);

export default BibleVerse;
