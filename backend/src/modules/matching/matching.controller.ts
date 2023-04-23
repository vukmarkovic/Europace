import { Body, Controller, Get, HttpCode, Inject, Param, Put, UseGuards } from '@nestjs/common';
import MatchingService from './matching.service';
import MatchDto from './models/dto/match.dto';
import InstallationGuard from '../../common/guards/installation.guard';
import Auth from '../../common/decorators/auth.decorator';
import { Auth as AuthEntity } from '../../common/modules/auth/model/entities/auth.entity';

/**
 * Matching configuration controller.
 *
 * Endpoints:
 * - matching/:entity - GET, returns fields with matches for given entity;
 * - matching/:entity - PUT, saves matches for given entity.
 *
 * Uses guard to identify client's portal.
 * @see MatchingService
 * @see InstallationGuard
 */
@Controller('matching')
export class MatchingController {
    constructor(@Inject(MatchingService) private readonly matching: MatchingService) {}

    @Get(':entity')
    @UseGuards(InstallationGuard)
    async getFields(@Auth() auth: AuthEntity, @Param('entity') entity: string) {
        return await this.matching.getFields(auth, entity);
    }

    @Put(':entity')
    @HttpCode(204)
    @UseGuards(InstallationGuard)
    async saveFields(@Auth() auth: AuthEntity, @Param('entity') entity: string, @Body() dto: MatchDto[]) {
        await this.matching.saveFields(auth, entity, dto);
    }
}
