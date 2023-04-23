import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import Auth from '../../common/decorators/auth.decorator';
import InstallationGuard from '../../common/guards/installation.guard';
import { EuropaceAuthService } from './europaceAuth.service';
import { Auth as AuthEntity } from '../../common/modules/auth/model/entities/auth.entity';

/**
 * Europace auth rest API integration controller.
 *
 * Endpoints:
 * - /europace/:domain/auth - POST, request for URL Silent-Sign-In;
 *
 * @see EuropaceAuthService
 */
@Controller('europace')
export class EuropaceAuthController {
    constructor(private readonly europaceAuthService: EuropaceAuthService) {}

    @Post('silentSignIn')
    @UseGuards(InstallationGuard)
    updatePlacement(@Auth() auth: AuthEntity,
                    @Body() { entityId, entityTypeId, access_token }: { entityId: number; entityTypeId: number, access_token: string }) {
        return this.europaceAuthService.getUrl(auth, entityTypeId, entityId, access_token);
    }
}
