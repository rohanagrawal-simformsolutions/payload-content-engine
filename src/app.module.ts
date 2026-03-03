import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module.js";
import { ContentModule } from "./content/content.module.js";
import { User } from "./auth/entities/user.entity.js";

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // TypeORM configuration for users table
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL,
      entities: [User],
      synchronize: true, // Set to false in production
    }),

    // Feature modules
    AuthModule,
    ContentModule,
  ],
})
export class AppModule {}
