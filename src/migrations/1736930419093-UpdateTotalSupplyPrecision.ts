import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTotalSupplyPrecision1736930419093 implements MigrationInterface {
    name = 'UpdateTotalSupplyPrecision1736930419093'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "global_tokens" ALTER COLUMN "totalSupply" TYPE numeric(35,10)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "global_tokens" ALTER COLUMN "totalSupply" TYPE numeric(30,10)`);
    }

}
