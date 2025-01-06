import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import AppDataSource from './data-source';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  try {
    await AppDataSource.initialize();
    console.log('Data Source initialized');
    await AppDataSource.runMigrations();
    console.log('Migrations have been executed');
  } catch (error) {
    console.error('Error during Data Source initialization or migrations:', error);
    process.exit(1);
  }

  await app.listen(3010);
}
bootstrap();
