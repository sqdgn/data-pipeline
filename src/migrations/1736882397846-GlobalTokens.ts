import { MigrationInterface, QueryRunner } from "typeorm";

export class GlobalTokens1736882397846 implements MigrationInterface {
    name = 'GlobalTokens1736882397846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "global_tokens" ("id" character varying NOT NULL, "chainId" integer NOT NULL, "title" character varying NOT NULL, "symbol" character varying NOT NULL, "address" character varying NOT NULL, "totalSupply" numeric(30,10) NOT NULL, "decimals" integer NOT NULL, "image" character varying, "creatorAddress" character varying, "created" TIMESTAMP, "contractAddress" character varying, "contractDeploymentHash" character varying, "chainName" character varying, "chainImage" character varying, "chainUrl" character varying, "socials" json, CONSTRAINT "UQ_1afa6323032252e51360501445d" UNIQUE ("address"), CONSTRAINT "PK_b1d05008597abb1d7f4ca0e3e79" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "global_tokens"`);
    }

}
