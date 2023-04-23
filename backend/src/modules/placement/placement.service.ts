import { Inject, Injectable, Logger } from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import IBxApiCall from "../bxapi/models/intefaces/bx.api.call";
import { BxApiService } from "../bxapi/bx.api.service";
import SettingsService from "../settings/settings.service";
import { Auth } from "../../common/modules/auth/model/entities/auth.entity";
import { ErrorHandler } from '../../common/modules/errorhandler/error.handler.service';


/**
 * The service responsible for placing the authorization button in SP.
 *
 * Uses:
 * @see BxApiService
 * @see SettingsService
 * @see ConfigService
 */

@Injectable()
export class PlacementService {
   private readonly logger = new Logger(PlacementService.name);

   constructor(
      @Inject(BxApiService) private readonly bx24: BxApiService,
      @Inject(SettingsService) private readonly settingsService: SettingsService,
      @Inject(ConfigService) private readonly config: ConfigService,
      private readonly errorHandler: ErrorHandler
   ) {}

   /**
    * Saves placement settings and binds application to Bitrix24 portal placements.
    * @param auth - authentication data.
    * @param entityTypeIds - Bitrix24 smart process type identifiers to place application to.
    * @see Auth
    * @see handleBind
    * @see SettingsService.getSettings
    * @returns true if succeeded.
    */
   async savePlacements(auth: Auth, entityTypeIds: string[]): Promise<boolean> {
      const placements = await this.settingsService.getSettings(auth, "placements");
      if(typeof placements === 'string'){
         const entityIds = placements.split(";");
         if (entityIds.length && entityIds[0] !== "") await this.handleBind(auth, entityIds, null, true);
      }
      if (!entityTypeIds.length) return true;
      return this.handleBind(auth, entityTypeIds, "Europace");
   }

   /**
    * Handles Bitrix24 portal application placing.
    * @param auth - authentication data.
    * @param placements - Bitrix24 smart process type identifiers to place application to.
    * @param title - placement title.
    * @param unbind - whether have to bind or unbind application (default false)
    * @returns true if succeeded.
    * @throws InternalServerErrorException if Bitrix24 api request failed.
    * @see Auth
    * @see BxApiService
    * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
    */
   async handleBind(auth: Auth, placements: string[], title: string, unbind = false): Promise<boolean>  {
      try{
         const method = `placement.${unbind ? 'un' : ''}bind`;
         const handler = `${this.config.get('APP_BASE_URL')}app`;
         const batch: IBxApiCall[] = [];
         placements.forEach((entityId, idx) => {
            batch.push({
               id: String(idx) + '_menu',
               method,
               data: {
                  PLACEMENT: `CRM_DYNAMIC_${entityId}_DETAIL_TOOLBAR`,
                  HANDLER: handler,
                  TITLE: title
               }
            });
         })

         if (!unbind) {
            this.logger.log(`Placements to bind: ${JSON.stringify(batch)}`);
         }

         const response = await this.bx24.callBXBatch(auth, batch);
         this.logger.log(`Placement results: ${JSON.stringify(response)}`);
      }
      catch (e) {
         this.errorHandler.internal({ auth, message: 'Placement error:', e });
      }
      return true;
   }
}
