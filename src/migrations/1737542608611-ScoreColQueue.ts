import { MigrationInterface, QueryRunner } from "typeorm";

export class ScoreColQueue1737542608611 implements MigrationInterface {
    name = 'ScoreColQueue1737542608611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queue" ADD "score" numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queue" DROP COLUMN "score"`);
    }

}
