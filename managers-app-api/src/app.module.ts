import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ChallengesModule } from './challenges/challenges.module';

@Module({
  imports: [
    // Load .env into ConfigService, available everywhere.
    ConfigModule.forRoot({ isGlobal: true }),

    // Connect to the SAME MongoDB Atlas database as the Express backend. Read the
    // URI/dbName through ConfigService (forRootAsync) so .env is loaded first.
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        dbName: config.get<string>('MONGODB_DB'),
      }),
    }),

    ChallengesModule,
  ],
})
export class AppModule {}
