import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './model/entities/auth.entity';

/**
 * Module providing service to work with authentication data and corresponding repository.
 * @see AuthService
 * @see Auth
 * @see Repository
 */
@Global()
@Module({
    imports: [TypeOrmModule.forFeature([Auth])],
    exports: [AuthService],
    providers: [AuthService],
})
export default class AuthModule {}
