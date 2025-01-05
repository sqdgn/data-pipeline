import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Trade } from './trade.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  address: string;

  @Column()
  fullDomain: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  description: string;

  // Relation to Trades
  @OneToMany(() => Trade, activity => activity.user, { cascade: true })
  activities: Trade[];

  @OneToMany(() => Trade, trade => trade.user, { cascade: true })
  trades: Trade[];
}
