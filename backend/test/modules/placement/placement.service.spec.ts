import { Test, TestingModule } from '@nestjs/testing';
import { ErrorHandler } from '../../../src/common/modules/errorhandler/error.handler.service';
import 'jest-extended';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';
import { PlacementService } from '../../../src/modules/placement/placement.service';
import { ConfigService } from '@nestjs/config';
import { BxApiService } from '../../../src/modules/bxapi/bx.api.service';
import SettingsService from '../../../src/modules/settings/settings.service';

jest.mock('@nestjs/common/services');
const authMock = {
    id: 1,
    domain: 'domaain.test',
    member_id: 'member_id.test',
} as Auth;

const configServiceMock = {
    get: jest.fn().mockReturnValue('https://app-url.com/')
}
 
const settingsMock = {
    getSettings: jest.fn().mockReturnThis(),
}
 
const bxMock = {
    getCRMMap: jest.fn().mockReturnThis(),
    callBXBatch: jest.fn().mockReturnThis()
}

describe('PlacementService', () => {
    let service: PlacementService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlacementService, 
                ErrorHandler,
                {
                    provide: ConfigService,
                    useValue: configServiceMock
                },
                {
                    provide: SettingsService,
                    useValue: settingsMock
                },
                {
                    provide: BxApiService,
                    useValue: bxMock
                }
            ],
        }).compile();
        service = module.get<PlacementService>(PlacementService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('savePlacements', () => {
        it('should be return true', () => {
            expect(service['savePlacements'](authMock, ["42"])).resolves.toBeTrue();
        });

        it('should be return true because settings returns null', () => {
            jest.spyOn(settingsMock, 'getSettings').mockReturnValueOnce(null);
            expect(service['savePlacements'](authMock, ["42"])).resolves.toBeTrue();
        });

        it('should be return true because handleBind returns true', () => {
            jest.spyOn(service, 'handleBind').mockReturnValueOnce(Promise.resolve(true));
            expect(service['savePlacements'](authMock, ["42"])).resolves.toBeTrue();
        });

        it('should be return false because handleBind returns false', () => {
            jest.spyOn(service, 'handleBind').mockReturnValueOnce(Promise.resolve(false));
            expect(service['savePlacements'](authMock, ["42"])).resolves.toBeFalse();
        });

    });

    describe('handleBind', () => {
        it('should be return true', () => {
            expect(service['handleBind'](authMock, ["42"], 'Europace')).resolves.toBeTrue();
        });

        it('should be called with batch', () => {
            const batch = [
                {
                    "data": {
                    "HANDLER": "https://app-url.com/app",
                    "PLACEMENT": "CRM_DYNAMIC_42_DETAIL_TOOLBAR",
                    "TITLE": "Europace",
                    },
                    "id": "0_menu",
                    "method": "placement.bind",
                }
            ];
            expect(service['handleBind'](authMock, ["42"], 'Europace')).resolves.toBeTrue();
            expect(bxMock.callBXBatch).toHaveBeenCalledWith(authMock, batch);
        });
        
        it('should not be called', () => {
            expect(service['savePlacements'](authMock, [])).resolves.toBeTrue();
            expect(bxMock.callBXBatch).not.toBeCalled();
        });
    });
});
