import { Sequelize, DataTypes, Model } from "sequelize";
import {FileType} from "../Enums/FileType";
import {Job} from "./Job";


export class File extends Model {
    declare readonly id: string;
    declare readonly job_id: string;
    declare readonly type: FileType;
    declare readonly path: string;
    declare readonly size: number;
    declare readonly mime_type: string;
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
                job_id: {
                    type: DataTypes.UUID,
                    allowNull: false
                },
                type: {
                    type: DataTypes.ENUM(...Object.values(FileType)),
                    allowNull: false,
                },
                path: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                size: {
                    type: DataTypes.BIGINT,
                    allowNull: true
                },
                mime_type: {
                    type: DataTypes.STRING,
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
                modelName: "file",
                tableName: "Files",
                timestamps: true,
                createdAt: "created_at",
                updatedAt: "updated_at",
                deletedAt: false,
                defaultScope: {
                    include: [{
                        model: Job,
                        as: "job"
                    }]
                }
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
