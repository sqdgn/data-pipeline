import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfitColumnsToQueue1736517661249 implements MigrationInterface {
    name = 'AddProfitColumnsToQueue1736517661249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queue" ADD "profit" numeric`);
        await queryRunner.query(`ALTER TABLE "queue" ADD "profitPercentage" numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queue" DROP COLUMN "profitPercentage"`);
        await queryRunner.query(`ALTER TABLE "queue" DROP COLUMN "profit"`);
    }

}
