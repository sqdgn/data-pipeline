import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('queue')
export class Queue {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    activityId: string;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column()
    category: string;

    @Column({ nullable: true })
    chainName: string;

    @Column({ nullable: true })
    chainImage: string;

    @Column({ nullable: true })
    methodName: string;

    @Column({ nullable: true })
    shareUrl: string;

    @ManyToOne(() => User, (user) => user.queues, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @Column({ nullable: true })
    fromTokenAddress: string;

    @Column({ nullable: true })
    fromTokenChainId: number;

    @Column({ nullable: true })
    fromTokenImage: string;

    @Column({ nullable: true })
    fromTokenName: string;

    @Column({ nullable: true })
    fromTokenSymbol: string;

    @Column('numeric', { nullable: true })
    fromTokenAmount: number;

    @Column('numeric', { nullable: true })
    fromTokenAmountUsd: number;

    @Column({ nullable: true })
    fromTokenIsPositive: boolean;

    @Column({ nullable: true })
    toTokenAddress: string;

    @Column({ nullable: true })
    toTokenChainId: number;

    @Column({ nullable: true })
    toTokenImage: string;

    @Column({ nullable: true })
    toTokenName: string;

    @Column({ nullable: true })
    toTokenSymbol: string;

    @Column('numeric', { nullable: true })
    toTokenAmount: number;

    @Column('numeric', { nullable: true })
    toTokenAmountUsd: number;

    @Column({ nullable: true })
    toTokenIsPositive: boolean;

    @Column({ default: false })
    processed: boolean;

    @Column('numeric', { nullable: true })
    profit: number;

    @Column('numeric', { nullable: true })
    profitPercentage: number;

    @Column({ type: 'json', nullable: true })
    context: any;

    @Column('numeric', { nullable: true })
    score: number;
}
