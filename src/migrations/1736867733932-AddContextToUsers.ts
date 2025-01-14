import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContextToUsers1736867733932 implements MigrationInterface {
    name = 'AddContextToUsers1736867733932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "context" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "context"`);
    }

}
