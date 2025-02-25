import { Entity, Column, PrimaryColumn, Unique } from 'typeorm';

@Entity('global_tokens')
export class GlobalToken {
    @PrimaryColumn()
    id: string;

    @Column()
    chainId: number;

    @Column()
    title: string;

    @Column()
    symbol: string;

    @Column()
    address: string;

    @Column('numeric', { precision: 78, scale: 30 })
    totalSupply: string;

    @Column()
    decimals: number;

    @Column({ nullable: true })
    image: string;

    @Column({ nullable: true })
    creatorAddress: string;

    @Column({ type: 'timestamp', nullable: true })
    created: Date;

    @Column({ nullable: true })
    contractAddress: string;

    @Column({ nullable: true })
    contractDeploymentHash: string;

    @Column({ nullable: true })
    chainName: string;

    @Column({ nullable: true })
    chainImage: string;

    @Column({ nullable: true })
    chainUrl: string;

    @Column('json', { nullable: true })
    socials: object;

    @Column({ type: 'varchar', nullable: true })
    marketCap: string;

    @Column({ type: 'varchar', nullable: true })
    liquidity: string;

    @Column({ type: 'varchar', nullable: true })
    volume: string;
}
