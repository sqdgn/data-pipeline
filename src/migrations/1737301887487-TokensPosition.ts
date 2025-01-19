import { MigrationInterface, QueryRunner } from "typeorm";

export class TokensPosition1737301887487 implements MigrationInterface {
    name = 'TokensPosition1737301887487'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tokens_position" ("id" SERIAL NOT NULL, "date" TIMESTAMP NOT NULL, "activityId" character varying NOT NULL, "userId" integer NOT NULL, "address" character varying(255) NOT NULL, "chain" character varying(50) NOT NULL, "operation" character varying(10) NOT NULL, "amount" numeric(20,8) NOT NULL, "position" character varying(50) NOT NULL, CONSTRAINT "PK_9c8ee2532c3022d80cb96067d6f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tokens_position" ADD CONSTRAINT "FK_533ed9e5ed0208d9c0a327b0125" FOREIGN KEY ("activityId") REFERENCES "activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tokens_position" ADD CONSTRAINT "FK_3bde0431e21418fa3910319883e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tokens_position" DROP CONSTRAINT "FK_3bde0431e21418fa3910319883e"`);
        await queryRunner.query(`ALTER TABLE "tokens_position" DROP CONSTRAINT "FK_533ed9e5ed0208d9c0a327b0125"`);
        await queryRunner.query(`DROP TABLE "tokens_position"`);
    }

}
