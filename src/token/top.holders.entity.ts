import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GlobalToken } from './token.entity';

@Entity('top_holders')
export class TopHolder {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => GlobalToken, (token) => token.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tokenId' })
    token: GlobalToken;

    @Column()
    tokenId: string;

    @Column()
    userAddress: string;

    @Column('json', { nullable: true })
    context: object;
}
