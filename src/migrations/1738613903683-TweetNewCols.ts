import { MigrationInterface, QueryRunner } from "typeorm";

export class TweetNewCols1738613903683 implements MigrationInterface {
    name = 'TweetNewCols1738613903683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweets" ADD "activityId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tweets" ADD "retweeted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "tweets" ADD "tweetId" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweets" DROP COLUMN "retweeted"`);
        await queryRunner.query(`ALTER TABLE "tweets" DROP COLUMN "activityId"`);
        await queryRunner.query(`ALTER TABLE "tweets" DROP COLUMN "tweetId"`);
    }

}
