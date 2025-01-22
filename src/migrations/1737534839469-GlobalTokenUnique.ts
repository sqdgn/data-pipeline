import { MigrationInterface, QueryRunner } from "typeorm";

export class GlobalTokenUnique1737534839469 implements MigrationInterface {
    name = 'GlobalTokenUnique1737534839469'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "global_tokens" DROP CONSTRAINT "UQ_1afa6323032252e51360501445d"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "global_tokens" ADD CONSTRAINT "UQ_1afa6323032252e51360501445d" UNIQUE ("address")`);
    }

}
