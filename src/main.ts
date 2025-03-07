import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import AppDataSource from './data-source';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    try {
        await AppDataSource.initialize();
        console.log('Data Source initialized');
        try {
            await AppDataSource.runMigrations();
            console.log('Migrations have been executed');
        } catch (migrationError) {
            console.error('Migration error:', migrationError.message);
        }
    } catch (error) {
        console.error('Error during Data Source initialization:', error);
        process.exit(1);
    }
    console.log('Server started')
    // await app.listen(process.env.PORT ?? 3010);
    // await app.listen(3010, '0.0.0.0');
    console.log(`🌐 Server is starting on port ${process.env.PORT ?? 3010}`);

    await app.listen(process.env.PORT ?? 3010, '0.0.0.0');
    // await app.listen(3010);
}
bootstrap();
