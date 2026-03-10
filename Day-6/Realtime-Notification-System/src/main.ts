import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for HTTP and WebSocket
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Serve static files (for HTML client)
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`🔌 WebSocket server is ready on ws://localhost:${port}`);
  console.log(`📦 MongoDB connected to ${process.env.MONGODB_URI || 'mongodb://localhost:27017/notification-system'}`);
}
bootstrap();
