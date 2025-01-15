import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTopTraders1736938445120 implements MigrationInterface {
    name = 'AddTopTraders1736938445120'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "top_traders" ("id" SERIAL NOT NULL, "tokenId" character varying NOT NULL, "userAddress" character varying NOT NULL, "stats" json, CONSTRAINT "PK_8f6cad90a696ee803bbd3fbc54f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "top_traders" ADD CONSTRAINT "FK_d1a7e1241963965ec70503cb476" FOREIGN KEY ("tokenId") REFERENCES "global_tokens"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "top_traders" DROP CONSTRAINT "FK_d1a7e1241963965ec70503cb476"`);
        await queryRunner.query(`DROP TABLE "top_traders"`);
    }

}
