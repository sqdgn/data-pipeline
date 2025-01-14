import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQueue1736240426755 implements MigrationInterface {
    name = 'AddQueue1736240426755';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "queue" ("id" SERIAL NOT NULL, "activityId" character varying NOT NULL, "date" TIMESTAMP NOT NULL, "category" character varying NOT NULL, "chainName" character varying, "chainImage" character varying, "methodName" character varying, "shareUrl" character varying, "userId" integer NOT NULL, "fromTokenChainId" integer, "fromTokenImage" character varying, "fromTokenName" character varying, "fromTokenSymbol" character varying, "fromTokenAmount" numeric, "fromTokenAmountUsd" numeric, "fromTokenIsPositive" boolean, "toTokenAddress" character varying, "toTokenChainId" integer, "toTokenImage" character varying, "toTokenName" character varying, "toTokenSymbol" character varying, "toTokenAmount" numeric, "toTokenAmountUsd" numeric, "toTokenIsPositive" boolean, "processed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_4adefbd9c73b3f9a49985a5529f" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "queue" ADD CONSTRAINT "FK_7e5f7e3c1d4063b548f9673a79f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "queue" DROP CONSTRAINT "FK_7e5f7e3c1d4063b548f9673a79f"`,
        );
        await queryRunner.query(`DROP TABLE "queue"`);
    }
}
