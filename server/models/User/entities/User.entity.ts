/**
 * @author  SHIN JONG HWAN
 */

import { registerEnumType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserAuthEntity } from "./UserAuth.entity";

@Entity()
export class UserEntity extends BaseEntity {
  @Index()
  @PrimaryColumn()
  id: string;

  @Column()
  provider: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  profile: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  fcmToken?: string;

  // @Column({ nullable: true })
  // age: number;

  // @Column({ type: "enum", enum: GenderEnum, nullable: true })
  // gender: GenderEnum;

  // 성인여부
  // @Column({ default: false })
  // isAdult: boolean;

  @Column({ type: "timestamptz", nullable: true })
  lastLogin: Date;

  // 관계 -----------------
  @OneToMany((type) => UserAuthEntity, (entity) => entity.user)
  auth: UserAuthEntity;

  @CreateDateColumn({ type: "timestamptz" })
  createdDate: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedDate: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deletedDate: Date;
}
