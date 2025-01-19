import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('top24h_tokens')
export class Top24hToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    address: string;

    @Column({ type: 'int' })
    chainId: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 50 })
    symbol: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    imageUrl: string;

    @Column({ type: 'varchar', length: 50 })
    totalSupply: string;

    @Column({ type: 'decimal', precision: 20, scale: 8 })
    priceUSD: number;

    @Column({ type: 'decimal', precision: 20, scale: 8 })
    marketCap: number;

    @Column({ type: 'decimal', precision: 20, scale: 8 })
    liquidity: number;

    @Column({ type: 'decimal', precision: 20, scale: 8 })
    volume24: number;

    @Column({ type: 'int' })
    holders: number;

    @Column({ type: 'timestamp' })
    createdAt: Date;
}
