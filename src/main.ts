import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ValidationPipe } from "@nestjs/common";
import { getPayloadInstance } from "./payload/payload-instance.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: "http://localhost:3001",
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Initialize Payload CMS (Local API only — admin panel is disabled)
  const payload = await getPayloadInstance();

  // Make Payload available globally
  globalThis.payload = payload;

  console.log("✓ Payload CMS initialized as content engine");

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
