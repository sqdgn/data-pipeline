import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('tokens')
export class Token {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    chain: string;

    @Column({ nullable: true })
    networkName: string;

    @Column({ nullable: true })
    networkImage: string;

    @Column('numeric', { nullable: true })
    summaryAmount: number;

    @Column()
    address: string;

    @Column()
    title: string;

    @Column()
    symbol: string;

    @Column('numeric')
    amount: number;

    @Column('numeric', { nullable: true })
    decimals: number;

    @Column('numeric', { nullable: true })
    price: number;

    @Column('numeric', { nullable: true })
    rawValue: number;

    @Column('numeric', { nullable: true })
    value: number;

    @Column({ nullable: true })
    tokenImage: string;

    @Column({ nullable: true })
    logo: string;

    @ManyToOne(() => User, (user) => user.trades, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;
}