import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('token_price_history')
export class TokenPriceHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    activityId: string;

    @Column()
    toTokenAddress: string;

    @Column()
    chainName: string;

    @Column({ type: 'timestamp' })
    addedAt: Date;

    @Column({ type: 'float' })
    initialPrice: number;

    @Column({ type: 'float' })
    maxPrice: number;

    @Column({ type: 'float' })
    maxGrowthPercent: number;

    @Column({ default: false })
    tweeted: boolean;

    @UpdateDateColumn()
    updatedAt: Date;
}
