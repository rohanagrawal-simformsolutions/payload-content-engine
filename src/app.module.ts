import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module.js";
import { ContentModule } from "./content/content.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Prisma (global — available everywhere)
    PrismaModule,

    // Feature modules
    AuthModule,
    ContentModule,
  ],
})
export class AppModule {}
