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

import {Job} from "./Job";
import {File} from "./File";
import {JobStatusUpdate} from "./JobStatusUpdate";

Job.initialize(sequelize);
File.initialize(sequelize);
JobStatusUpdate.initialize(sequelize);

Job.associate();
File.associate();
JobStatusUpdate.associate();

export {
    sequelize,
    Job,
    File,
    JobStatusUpdate,
}