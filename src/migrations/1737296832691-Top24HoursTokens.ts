import { MigrationInterface, QueryRunner } from "typeorm";

export class Top24HoursTokens1737296832691 implements MigrationInterface {
    name = 'Top24HoursTokens1737296832691'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "top24h_tokens" ("id" SERIAL NOT NULL, "address" character varying(255) NOT NULL, "chainId" integer NOT NULL, "name" character varying(255) NOT NULL, "symbol" character varying(50) NOT NULL, "imageUrl" character varying(500), "totalSupply" character varying(50) NOT NULL, "priceUSD" numeric(20,8) NOT NULL, "marketCap" numeric(20,8) NOT NULL, "liquidity" numeric(20,8) NOT NULL, "volume24" numeric(20,8) NOT NULL, "holders" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_bba21e5a6203e72e80146b7c8eb" UNIQUE ("address"), CONSTRAINT "PK_f631255cd7637c18fe70c7d9bf1" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "top24h_tokens"`);
    }

}
