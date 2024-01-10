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
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserAuthEntity } from "./UserAuth.entity";
import { UserEmailVerifyLogEntity } from "./UserEmailVerifyLog.entity";

@Entity()
export class UserEntity extends BaseEntity {
  @Index()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  picture: string; // user profile Image

  // ----------------- email data --------------------
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  emailVerified?: boolean;

  @Column({ nullable: true })
  emailVerifiedAt?: Date;
  // -------------------------------------------------

  // --------------- phone number data ---------------
  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  phoneNumberVerified?: boolean;

  @Column({ nullable: true })
  phoneNumberVerifiedAt?: Date;
  // -------------------------------------------------
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
  auth: UserAuthEntity[];

  @OneToMany((type) => UserEmailVerifyLogEntity, (entity) => entity.user)
  emailVerifyLog: UserEmailVerifyLogEntity[];

  @CreateDateColumn({ type: "timestamptz" })
  createdDate: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedDate: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deletedDate: Date;
}
