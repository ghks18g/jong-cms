import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "./User.entity";
import { registerEnumType } from "type-graphql";

export enum EmailVerifyType {
  EMAIL_VERIFY = "email_verify",
  PASSWORD_RESET = "password_reset",
}

registerEnumType(EmailVerifyType, {
  name: "EmailVerifyType",
});

@Entity()
export class UserEmailVerifyLogEntity extends BaseEntity {
  @PrimaryColumn("uuid")
  id: string; // Otp Id (uuid)

  @Column()
  type: EmailVerifyType;

  @ManyToOne((type) => UserEntity, (entity) => entity.emailVerifyLog)
  user: UserEntity;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  verifiedAt: Date;

  @CreateDateColumn({ type: "timestamptz" })
  createdDate: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedDate: Date;

  @DeleteDateColumn({ type: "timestamptz" })
  deletedDate: Date;
}
