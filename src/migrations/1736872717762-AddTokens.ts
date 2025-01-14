import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTokens1736872717762 implements MigrationInterface {
    name = 'AddTokens1736872717762'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tokens" ("id" SERIAL NOT NULL, "chain" character varying NOT NULL, "networkName" character varying, "networkImage" character varying, "summaryAmount" numeric, "address" character varying NOT NULL, "title" character varying NOT NULL, "symbol" character varying NOT NULL, "amount" numeric NOT NULL, "decimals" numeric, "price" numeric, "rawValue" numeric, "value" numeric, "tokenImage" character varying, "logo" character varying, "userId" integer NOT NULL, CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tokens" ADD CONSTRAINT "FK_d417e5d35f2434afc4bd48cb4d2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tokens" DROP CONSTRAINT "FK_d417e5d35f2434afc4bd48cb4d2"`);
        await queryRunner.query(`DROP TABLE "tokens"`);
    }

}
