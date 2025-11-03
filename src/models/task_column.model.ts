import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";
import { TaskStatusEnum } from "../enums/status.enum";

export interface TaskColumnI {
    id: number,
    projectId: number,
    name: string,
    color: string,
    type: TaskStatusEnum,
}

@Table({
    tableName: 'task_columns',
    timestamps: true,
    underscored: true,
})
export class TaskColumn extends Model implements TaskColumnI{
    @PrimaryKey
    @AutoIncrement
    @Column({ type: DataType.INTEGER })
    id!: number;
    
    @Column({ type: DataType.INTEGER })
    projectId!: number;

    @Column({ type: DataType.STRING })
    name!: string;

    @Column({ type: DataType.STRING })
    color!: string;

    @Column({ type: DataType.INTEGER })
    type!: TaskStatusEnum;
}