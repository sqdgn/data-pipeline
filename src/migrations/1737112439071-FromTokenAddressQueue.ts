import { MigrationInterface, QueryRunner } from "typeorm";

export class FromTokenAddressQueue1737112439071 implements MigrationInterface {
    name = 'FromTokenAddressQueue1737112439071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queue" ADD "fromTokenAddress" character varying`);
        await queryRunner.query(`ALTER TABLE "queue" ADD "context" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queue" DROP COLUMN "context"`);
        await queryRunner.query(`ALTER TABLE "queue" DROP COLUMN "fromTokenAddress"`);
    }

}
