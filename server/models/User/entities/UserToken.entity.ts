import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from "typeorm";

/**
 *
 *
 */
@Entity()
export class UserTokenEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  provider: string;

  @Column()
  algorithm: string;

  @Column()
  subject: string;

  @Column()
  expiresIn: number;

  @Column({ default: false })
  destroyed: boolean;

  @Column()
  issuer: string;

  @Column({ default: null, nullable: true })
  latestAccessTokenDate?: Date;

  @CreateDateColumn({ type: "timestamptz" })
  createdDate: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedDate: Date;

  @DeleteDateColumn({ type: "timestamptz" })
  deletedDate: Date;
}
