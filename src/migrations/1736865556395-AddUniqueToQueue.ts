import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueToQueue1736865556395 implements MigrationInterface {
    name = 'AddUniqueToQueue1736865556395';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "queue" ADD CONSTRAINT "UQ_1758466af04e2b52ba995023b91" UNIQUE ("activityId")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "queue" DROP CONSTRAINT "UQ_1758466af04e2b52ba995023b91"`,
        );
    }
}
