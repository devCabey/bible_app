import { Sequelize } from "sequelize";

const sequelize = new Sequelize("bible", "root", "root", {
    host: "localhost",
    dialect: "mysql",
    logging: false,
});

export default sequelize;
