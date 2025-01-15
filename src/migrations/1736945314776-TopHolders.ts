import { MigrationInterface, QueryRunner } from "typeorm";

export class TopHolders1736945314776 implements MigrationInterface {
    name = 'TopHolders1736945314776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "top_holders" ("id" SERIAL NOT NULL, "tokenId" character varying NOT NULL, "userAddress" character varying NOT NULL, "context" json, CONSTRAINT "PK_6119e356afb3d43ab6d6322cea5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "top_holders" ADD CONSTRAINT "FK_18e23cc032c890dd2adb1472d89" FOREIGN KEY ("tokenId") REFERENCES "global_tokens"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "top_holders" DROP CONSTRAINT "FK_18e23cc032c890dd2adb1472d89"`);
        await queryRunner.query(`DROP TABLE "top_holders"`);
    }

}
