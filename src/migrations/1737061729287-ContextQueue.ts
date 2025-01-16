import { MigrationInterface, QueryRunner } from "typeorm";

export class ContextQueue1737061729287 implements MigrationInterface {
    name = 'ContextQueue1737061729287'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queue" ADD "context" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queue" DROP COLUMN "context"`);
    }

}
