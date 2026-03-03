import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { User } from "./entities/user.entity.js";
import { JwtStrategy } from "./jwt.strategy.js";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    // registerAsync defers the factory to DI instantiation time, which is after
    // ConfigModule.forRoot() has called dotenv.config(). Using register() instead
    // reads process.env.JWT_SECRET too early (during ESM module evaluation, before
    // dotenv runs), causing a sign/verify secret mismatch and 401 on every request.
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || "your-secret-key",
        signOptions: { expiresIn: "7d" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
