import { Test, TestingModule } from '@nestjs/testing';
import { ErrorHandler } from '../../../src/common/modules/errorhandler/error.handler.service';
import 'jest-extended';
import { Auth } from '../../../src/common/modules/auth/model/entities/auth.entity';
import { ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import EuropaceService from '../../../src/modules/europace/europace.service';
import { IEuropaceLeadMatching } from '../../../src/modules/europace/models/interfaces/matching/europace.lead.matching';
import ENDPOINTS from '../../../src/modules/europace/models/constants/europace.endpoint';

jest.mock('@nestjs/common/services');
const authMock = {
    id: 1,
    domain: 'domaain.test',
    member_id: 'member_id.test',
} as Auth;

const tokenResponse = {
    access_token: 'token',
    token_type: 'bearer',
};

const silentSignInAuthResponce = {
    otp: 'otp',
};

const leadResponse = {};

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;
axios.post = jest.fn().mockReturnThis();
axios.get = jest.fn().mockReturnValue({ data: leadResponse });

describe('EuropaceService', () => {
    let service: EuropaceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EuropaceService, ErrorHandler],
        }).compile();
        service = module.get<EuropaceService>(EuropaceService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getToken', () => {
        it('should throw exception for empty data', () => {
            expect(service['getToken'](authMock, '', 'username', 'password')).rejects.toThrowWithMessage(ForbiddenException, 'getToken - Empty data');
            expect(service['getToken'](authMock, 'url', '', 'password')).rejects.toThrowWithMessage(ForbiddenException, 'getToken - Empty data');
            expect(service['getToken'](authMock, 'url', 'username', '')).rejects.toThrowWithMessage(ForbiddenException, 'getToken - Empty data');
        });

        it('should throw access denied error for invalid data', () => {
            jest.spyOn(axiosMock, 'post').mockImplementationOnce(async () => {
                throw { response: { status: 401 } };
            });

            expect(service.getToken(authMock, 'url', 'username', 'password')).rejects.toThrowWithMessage(ForbiddenException, 'wrongApiCredentials');
        });

        it('should throw internal error for Europace error', () => {
            jest.spyOn(axiosMock, 'post').mockImplementationOnce(async () => {
                throw 'error';
            });

            expect(service['getToken'](authMock, 'url', 'username', 'password')).rejects.toThrowWithMessage(
                InternalServerErrorException,
                'Failed to get Europace token',
            );
        });

        it('should get token successfully', () => {
            axiosMock.post.mockReturnValueOnce(
                Promise.resolve({
                    data: tokenResponse,
                }),
            );

            expect(service['getToken'](authMock, 'url', 'username', 'password')).resolves.toEqual(tokenResponse);

            expect(axiosMock.post).toHaveBeenCalledWith('url/auth/token', 'grant_type=client_credentials&subject=', {
                headers: {
                    Authorization: `Basic ${Buffer.from(`username:password`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
        });
    });

    describe('silentSignIn', () => {
        it('should throw exception for empty data', () => {
            expect(service['silentSignIn'](authMock, '', 'europaceId', 'vorgangsnummer')).rejects.toThrowWithMessage(
                ForbiddenException,
                'silentSignIn - Empty data',
            );
            expect(service['silentSignIn'](authMock, 'authToken', '', 'vorgangsnummer')).rejects.toThrowWithMessage(
                ForbiddenException,
                'silentSignIn - Empty data',
            );
            expect(service['silentSignIn'](authMock, 'authToken', 'europaceId', '')).rejects.toThrowWithMessage(
                ForbiddenException,
                'silentSignIn - Empty data',
            );
        });

        it('should throw access denied error for invalid data', () => {
            jest.spyOn(axiosMock, 'post').mockImplementationOnce(async () => {
                throw { response: { status: 401 } };
            });

            expect(service.silentSignIn(authMock, 'authToken', 'europaceId', 'vorgangsnummer')).rejects.toThrowWithMessage(
                ForbiddenException,
                'wrongApiCredentials',
            );
        });

        it('should throw internal error for Europace error', () => {
            jest.spyOn(axiosMock, 'post').mockImplementationOnce(async () => {
                throw 'error';
            });

            expect(service['silentSignIn'](authMock, 'authToken', 'partnerId', 'vorgangsnummer')).rejects.toThrowWithMessage(
                InternalServerErrorException,
                'Failed to Silent-Sign-In',
            );
        });

        it('should get otp successfully', () => {
            axiosMock.post.mockReturnValueOnce(
                Promise.resolve({
                    data: silentSignInAuthResponce,
                }),
            );

            const vorgangsnummer = 'vorgangsnummer123';
            const partnerId = 'partnerId123';

            expect(service['silentSignIn'](authMock, 'authToken', partnerId, vorgangsnummer)).resolves.toEqual(
                `https://www.europace2.de/authorize/silent-sign-in?subject=${partnerId}&redirect_uri=/vorgang/oeffne/${vorgangsnummer}&otp=otp`,
            );

            expect(axiosMock.post).toHaveBeenCalledWith(
                `https://www.europace2.de/authorize/silent-sign-in?subject=${partnerId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer authToken`,
                    },
                },
            );
        });
    });

    /*describe('createCase', () => {
        it('should throw access denied error if token is empty', async () => {
            await expect(service.createCase(authMock, '', {} as IEuropaceLeadMatching))
               .rejects.toThrowWithMessage(ForbiddenException, 'createCase - Empty token');
            await expect(service.createCase(authMock, undefined, {} as IEuropaceLeadMatching))
               .rejects.toThrowWithMessage(ForbiddenException, 'createCase - Empty token');
            await expect(service.createCase(authMock, null, {} as IEuropaceLeadMatching))
               .rejects.toThrowWithMessage(ForbiddenException, 'createCase - Empty token');
        });

        it('should throw access denied error if token has no access', () => {
            axiosMock.post.mockRejectedValueOnce({ response: { status: 401 }});
            return expect(service.createCase(authMock, 'token', {} as IEuropaceLeadMatching))
               .rejects.toThrowWithMessage(ForbiddenException, 'wrongApiCredentials');
        });

        it('should throw internal server error', () => {
            axiosMock.post.mockRejectedValueOnce({ response: { data: { detail: 'error message' } } });
            return expect(service.createCase(authMock, 'token', {} as IEuropaceLeadMatching))
               .rejects.toThrowWithMessage(InternalServerErrorException, 'Failed to create case: error message');
        });

        it('should return europace api response data', async () => {
            const lead = {
                id: 'id',
                field1: 1,
                field2: 'str'
            } as unknown as IEuropaceLeadMatching;
            axiosMock.post.mockResolvedValueOnce({ data: 'europace response' });
            await expect(service.createCase(authMock, 'token', lead))
               .resolves.toEqual('europace response');
            expect(axiosMock.post).toHaveBeenCalledWith(
               ENDPOINTS.CASE_CREATE,
               lead,
               { headers: { Authorization: `Bearer token` } }
            )
        })
    });*/

    describe('updateCase', () => {
        it('should throw access denied error if token is empty', async () => {
            await expect(service.updateCase(authMock, '', {} as IEuropaceLeadMatching))
               .rejects.toThrowWithMessage(ForbiddenException, 'updateCase - Empty token');
            await expect(service.updateCase(authMock, undefined, {} as IEuropaceLeadMatching))
               .rejects.toThrowWithMessage(ForbiddenException, 'updateCase - Empty token');
            await expect(service.updateCase(authMock, null, {} as IEuropaceLeadMatching))
               .rejects.toThrowWithMessage(ForbiddenException, 'updateCase - Empty token');
        });

        it('should throw access denied error if token has no access', () => {
            axiosMock.put.mockRejectedValueOnce({ response: { status: 401 }});
            return expect(service.updateCase(authMock, 'token', {} as IEuropaceLeadMatching))
               .rejects.toThrowWithMessage(ForbiddenException, 'wrongApiCredentials');
        });

        it('should throw internal server error', () => {
            axiosMock.put.mockRejectedValueOnce({ response: { data: { detail: 'error message' } } });
            return expect(service.updateCase(authMock, 'token', {} as IEuropaceLeadMatching))
               .rejects.toThrowWithMessage(InternalServerErrorException, 'Failed to update case: error message');
        });

        it('should return europace api response data', async () => {
            const lead = {
                id: '42',
                field1: 1,
                field2: 'str'
            } as unknown as IEuropaceLeadMatching;
            axiosMock.put.mockResolvedValueOnce({ data: 'europace response' });
            await expect(service.updateCase(authMock, 'token', lead))
               .resolves.toEqual('Case updated successfully');
            expect(axiosMock.put).toHaveBeenCalledWith(
               ENDPOINTS.CASE_REPLACE.replace(':id', '42'),
               lead,
               { headers: { Authorization: `Bearer token` } }
            )
        })
    });

    describe('getCase', () => {
        it('should throw access denied error if token is empty', async () => {
            await expect(service.getCase(authMock, '', 'vorgangsNummer'))
               .rejects.toThrowWithMessage(ForbiddenException, 'getCase - Empty data');
            await expect(service.getCase(authMock, undefined, 'vorgangsNummer'))
               .rejects.toThrowWithMessage(ForbiddenException, 'getCase - Empty data');
            await expect(service.getCase(authMock, null, 'vorgangsNummer'))
               .rejects.toThrowWithMessage(ForbiddenException, 'getCase - Empty data');
        });

        it('should throw access denied error if case id is empty', async () => {
            await expect(service.getCase(authMock, 'token', ''))
               .rejects.toThrowWithMessage(ForbiddenException, 'getCase - Empty data');
            await expect(service.getCase(authMock, 'token', undefined))
               .rejects.toThrowWithMessage(ForbiddenException, 'getCase - Empty data');
            await expect(service.getCase(authMock, 'token', null))
               .rejects.toThrowWithMessage(ForbiddenException, 'getCase - Empty data');
        });

        it('should throw access denied error if token has no access', () => {
            axiosMock.get.mockRejectedValueOnce({ response: { status: 401 }});
            return expect(service.getCase(authMock, 'token', 'vorgangsNummer'))
               .rejects.toThrowWithMessage(ForbiddenException, 'wrongApiCredentials');
        });

        it('should throw internal server error', () => {
            axiosMock.get.mockRejectedValueOnce({ response: { data: { detail: 'error message' } } });
            return expect(service.getCase(authMock, 'token', 'vorgangsNummer'))
               .rejects.toThrowWithMessage(InternalServerErrorException, 'Failed to get case: error message');
        });

        it('should return europace api response data', async () => {
            const lead = {
                id: '42',
                field1: 1,
                field2: 'str'
            } as unknown as IEuropaceLeadMatching;
            axiosMock.get.mockResolvedValueOnce({ data: lead });
            await expect(service.getCase(authMock, 'token', 'vorgangsNummer'))
               .resolves.toEqual(lead);
            expect(axiosMock.get).toHaveBeenCalledWith(
               ENDPOINTS.CASE_GET.replace(':id', 'vorgangsNummer'),
               { headers: { Authorization: `Bearer token` } }
            )
        })
    });

    describe('updateEditor', () => {
        it('should return if lead id empty', async () => {
            await expect(service.updateEditor(authMock, '', 'token', 'newPartner')).toResolve();
            await expect(service.updateEditor(authMock, undefined, 'token', 'newPartner')).toResolve();
            await expect(service.updateEditor(authMock, null, 'token', 'newPartner')).toResolve();
            expect(axiosMock.put).not.toBeCalled()
        });

        it('should throw access denied error if token is empty', async () => {
            await expect(service.updateEditor(authMock, 'vorgangsNummer', '', 'partnerId'))
               .rejects.toThrowWithMessage(ForbiddenException, 'updateEditor - Empty token');
            await expect(service.updateEditor(authMock, 'vorgangsNummer', undefined, 'partnerId'))
               .rejects.toThrowWithMessage(ForbiddenException, 'updateEditor - Empty token');
            await expect(service.updateEditor(authMock, 'vorgangsNummer', null, 'partnerId'))
               .rejects.toThrowWithMessage(ForbiddenException, 'updateEditor - Empty token');
        });

        it('should throw access denied error if token has no access', () => {
            axiosMock.put.mockRejectedValueOnce({ response: { status: 401 }});
            return expect(service.updateEditor(authMock, 'vorgangsNummer', 'token', 'newPartner'))
               .rejects.toThrowWithMessage(ForbiddenException, 'wrongApiCredentials');
        });

        it('should throw internal server error', () => {
            axiosMock.put.mockRejectedValueOnce({ response: { data: { detail: 'error message' } } });
            return expect(service.updateEditor(authMock, 'vorgangsNummer', 'token', 'newPartner'))
               .rejects.toThrowWithMessage(InternalServerErrorException, 'Failed to update editor: error message');
        });

        it('should resolve', async () => {
            await expect(service.updateEditor(authMock, 'vorgangsNummer', 'token', 'newPartner'))
               .toResolve()
            expect(axiosMock.put).toHaveBeenCalledWith(
               ENDPOINTS.SET_EDITOR.replace(':id', 'vorgangsNummer'),
               { partnerId: 'newPartner' },
               { headers: { Authorization: `Bearer token` } }
            )
        })
    })
});
