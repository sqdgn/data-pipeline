import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTweet1736513662589 implements MigrationInterface {
    name = 'AddTweet1736513662589'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tweets" ("id" SERIAL NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_19d841599ad812c558807aec76c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tweets"`);
    }

}
