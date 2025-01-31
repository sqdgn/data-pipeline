import { MigrationInterface, QueryRunner } from "typeorm";

export class TokenPriceHistory1738358300796 implements MigrationInterface {
    name = 'TokenPriceHistory1738358300796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "token_price_history" ("id" SERIAL NOT NULL, "activityId" character varying NOT NULL, "toTokenAddress" character varying NOT NULL, "chainName" character varying NOT NULL, "addedAt" TIMESTAMP NOT NULL, "initialPrice" double precision NOT NULL, "maxPrice" double precision NOT NULL, "maxGrowthPercent" double precision NOT NULL, "tweeted" boolean NOT NULL DEFAULT false, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a6f53462e64d0b009cb9cfd0eb9" UNIQUE ("activityId"), CONSTRAINT "PK_60c0da7a7048419c636148edfe9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "token_price_history"`);
    }

}
