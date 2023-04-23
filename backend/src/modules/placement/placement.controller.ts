import {Body, Controller, HttpCode, Post, UseGuards} from "@nestjs/common";
import InstallationGuard from "../../common/guards/installation.guard";
import {PlacementService} from "./placement.service";
import { Auth as AuthEntity } from '../../common/modules/auth/model/entities/auth.entity';
import Auth from "../../common/decorators/auth.decorator";
/**
 * Europace auth rest API integration controller.
 *
 * Endpoints:
 * - /placement/update - POST, request to save the list of smart processes in which the authorization button is installed;
 * 
 * @see PlacementService
 */

@Controller('placement')
export class PlacementController {
   constructor(private readonly placementService: PlacementService) {}

   @Post('update')
   @UseGuards(InstallationGuard)
   @HttpCode(201)
   updatePlacement(@Auth() auth: AuthEntity, @Body() {placements}: {placements: string[]}) {
      return this.placementService.savePlacements(auth, placements);
   }
}
