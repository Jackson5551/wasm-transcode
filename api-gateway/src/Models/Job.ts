import {Sequelize, DataTypes, Model} from "sequelize";
import {JobStatus} from "../Enums/JobStatus";
import {File} from "./File";
import {JobStatusUpdate} from "./JobStatusUpdate";

export class Job extends Model {
    declare readonly id: string;
    declare input_path: string;
    declare output_path: string;
    declare input_format: string;
    declare output_format: string;
    declare status: JobStatus;
    declare progress: number;
    declare readonly error_message: string;
    declare readonly created_at: string;
    declare readonly updated_at: string;

    public static initialize(sequelize: Sequelize) {
        this.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true
                },
                input_path: {
                    type: DataTypes.STRING,
                    allowNull: true,
                    defaultValue: ""
                },
                output_path: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                input_format: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                output_format: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                status: {
                    type: DataTypes.ENUM(...Object.values(JobStatus)),
                    allowNull: false,
                    defaultValue: JobStatus.QUEUED
                },
                progress: {
                    type: DataTypes.FLOAT,
                    allowNull: true,
                    validate: {
                        min: 0,
                        max: 100
                    }
                },
                error_message: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                created_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                },
                updated_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                }
            },
            {
                sequelize,
                tableName: "Jobs",
                modelName: "job",
                timestamps: true,
                createdAt: "created_at",
                updatedAt: "updated_at",
                deletedAt: false
            }
        )
    }

    public static associate() {
        this.hasMany(File, {
            foreignKey: "job_id",
            as: "files"
        });
        this.hasMany(JobStatusUpdate, {
            foreignKey: 'job_id',
            as: 'status_updates'
        });
    }
}

export interface IJobForm {
    input_path: string;
    output_path: string;
    input_format: string;
    output_format: string;
}