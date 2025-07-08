import { DataTypes, Sequelize } from "sequelize";

const db = process.env.DB_NAME as string;
const username = process.env.DB_USER as string;
const password = process.env.DB_PASS as string;
const port = process.env.DB_PORT as string;

const sequelize: Sequelize = new Sequelize(db, username, password, {
    dialect: "mysql",
    host: process.env.DB_HOST,
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