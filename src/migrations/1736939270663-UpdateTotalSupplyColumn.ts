import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTotalSupplyColumn1736939270663 implements MigrationInterface {
    name = 'UpdateTotalSupplyColumn1736939270663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "global_tokens" ALTER COLUMN "totalSupply" TYPE numeric(78,30)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "global_tokens" ALTER COLUMN "totalSupply" TYPE numeric(35,10)`);
    }

}
