import { MigrationInterface, QueryRunner } from "typeorm";

export class NewColsGlobalTokens1736884694416 implements MigrationInterface {
    name = 'NewColsGlobalTokens1736884694416'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "global_tokens" ADD "marketCap" character varying`);
        await queryRunner.query(`ALTER TABLE "global_tokens" ADD "liquidity" character varying`);
        await queryRunner.query(`ALTER TABLE "global_tokens" ADD "volume" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "global_tokens" DROP COLUMN "volume"`);
        await queryRunner.query(`ALTER TABLE "global_tokens" DROP COLUMN "liquidity"`);
        await queryRunner.query(`ALTER TABLE "global_tokens" DROP COLUMN "marketCap"`);
    }

}
