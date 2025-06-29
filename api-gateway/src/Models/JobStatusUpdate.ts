import { Sequelize, DataTypes, Model } from "sequelize";
import {Job} from "./Job";

export class JobStatusUpdate extends Model{
    declare readonly id: number;
    declare readonly job_id: string;
    declare readonly status: string;
    declare readonly message: string;
    declare readonly created_at: string;

    public static initialize(sequelize: Sequelize) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                job_id: {
                    type: DataTypes.UUID,
                    allowNull: false
                },
                status: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                message: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                created_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                }
            },
            {
                sequelize,
                modelName: "job_status_update",
                tableName: "JobStatusUpdates",
                timestamps: false,
                createdAt: "created_at",
                updatedAt: false
            }
        );
    }

    public static associate() {
        this.belongsTo(Job, {
            foreignKey: "job_id",
            as: "job"
        });
    }
}
