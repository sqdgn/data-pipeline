import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('trades')
export class Trade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tokenAddress: string;

  @Column()
  chainId: number;

  @Column()
  decimals: number;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column()
  imageUrl: string;

  @Column('numeric', { precision: 78, scale: 0 })
  totalSupply: string;

  @Column()
  boughtCount: number;

  @Column('numeric', { precision: 30, scale: 10 })
  boughtAmount: number;

  @Column()
  soldCount: number;

  @Column('numeric', { precision: 30, scale: 10 })
  soldAmount: number;

  @Column()
  totalCount: number;

  @Column('numeric', { precision: 30, scale: 10 })
  pnlAmount: number;

  @Column('numeric', { precision: 10, scale: 2 })
  pnlPercent: number;

  @ManyToOne(() => User, user => user.trades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;
}
