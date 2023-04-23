import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards } from '@nestjs/common';
import IBxRobotData from './models/interfaces/bx.robot.data';
import RobotService from './robot.service';
import RobotGuard from './guards/robot.guard';
import Auth from '../../common/decorators/auth.decorator';
import { Auth as AuthEntity } from '../../common/modules/auth/model/entities/auth.entity';

/**
 * Bitrix24 robot handlers controller.
 * Provides endpoints for Bitrix24 robots.
 *
 * Uses guard to identify client's portal.
 *
 * Endpoints:
 * - robot/testhandler - POST, test handler;
 * - robot/customer-put - POST, post customer data to Turista ERP API;
 * - robot/customer-get - POST, update customer data from Turista ERP API;
 * - robot/order-get - POST, update order data from Turista ERP API;
 * - robot/member-get - POST, update member data from Turista ERP API;
 * - robot/confirmations-get - POST, update confirmations/permissions data from Turista ERP API;
 * - robot/travels-get - POST, update travels data from Turista ERP API.
 *
 * @see RobotGuard
 * @see RobotService
 */
@Controller('robot')
export default class RobotController {
    constructor(@Inject(RobotService) private readonly service: RobotService) {}

    @Post('testHandler')
    @HttpCode(HttpStatus.NO_CONTENT)
    async transfer(@Body() data: IBxRobotData) {
        await this.service.test(data);
    }

    @Post('case-put')
    @UseGuards(RobotGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async createOrUpdateCase(@Auth() auth: AuthEntity, @Body() data: IBxRobotData) {
        await this.service.createOrUpdateCase(auth, data);
    }

    @Post('case-get')
    @UseGuards(RobotGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async getCustomer(@Auth() auth: AuthEntity, @Body() data: IBxRobotData) {
        await this.service.getCase(auth, data);
    }
}
