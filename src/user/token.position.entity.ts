import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { ActivityEntity } from './activity.entity';

@Entity('tokens_position')
export class TokenPosition {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp' })
    date: Date;

    @ManyToOne(() => ActivityEntity)
    @JoinColumn({ name: 'activityId' })
    activity: ActivityEntity;

    @Column()
    activityId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @Column({ type: 'varchar', length: 255 })
    address: string;

    @Column({ type: 'varchar', length: 50 })
    chain: string;

    @Column({ type: 'varchar', length: 10 })
    operation: string;

    @Column({ type: 'decimal', precision: 20, scale: 8 })
    amount: number;

    @Column({ type: 'varchar', length: 50 })
    position: string;
}
