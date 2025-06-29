import { DataTypes, Sequelize } from "sequelize";

const db = process.env.MYSQL_DB as string;
const username = process.env.MYSQL_USER as string;
const password = process.env.MYSQL_PWD as string;
const port = process.env.MYSQL_PORT as string;

const sequelize: Sequelize = new Sequelize(db, username, password, {
    dialect: "mysql",
    host: process.env.MYSQL_HOST,
    port: parseInt(port),
    logging: false
});
