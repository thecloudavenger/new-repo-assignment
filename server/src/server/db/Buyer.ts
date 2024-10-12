import { Table, Column, Model, HasMany } from "sequelize-typescript";

@Table({ createdAt: false, updatedAt: false })
export class Buyer extends Model {
  @Column({ primaryKey: true })
  id!: string;

  @Column
  name!: string;
}
