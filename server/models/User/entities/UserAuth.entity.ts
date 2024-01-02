/**
 * @author  SHIN JONG HWAN
 */

import { UserEntity } from "./User.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  RelationId,
} from "typeorm";

@Entity()
export class UserAuthEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne((type) => UserEntity, (entity) => entity.auth, {
    cascade: true,
    onDelete: "CASCADE",
  })
  user: UserEntity;

  @Column()
  identifyProvider: string;

  @Column()
  identifyKey: string;

  @Column()
  identifyConnectedAt: Date;

  @Column({ nullable: true })
  otpId: string;

  @Column({ nullable: true })
  otpCode: number;

  @Column({ nullable: true, default: false })
  otpVerified: boolean;

  @Column({ nullable: true })
  otpExpires: Date;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @DeleteDateColumn()
  deletedDate: Date;
}
