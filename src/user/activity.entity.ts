import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('activity')
export class ActivityEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  block: number;

  @Column()
  category: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ nullable: true })
  toAddress: string;

  @Column({ nullable: true })
  chainName: string;

  @Column({ nullable: true })
  chainUrl: string;

  @Column({ nullable: true })
  chainImage: string;

  @Column({ nullable: true })
  methodName: string;

  @Column({ nullable: true })
  methodSuffix: string;

  @Column({ nullable: true })
  toName: string;

  @Column({ nullable: true })
  toImage: string;

  @Column({ nullable: true })
  shareUrl: string;

  @Column({ nullable: true })
  shareImage: string;

  @Column({ nullable: true })
  shareTitle: string;

  @Column({ type: 'json', nullable: true })
  tokens: object[];


  @Column({ type: 'json', nullable: true })
  gallery: object[];

  @Column({ type: 'json', nullable: true })
  copies: object[];

  @ManyToOne(() => User, user => user.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;
}

