import { chunk } from 'lodash';
import { keyBy } from 'lodash/collection';
import { Inject, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../common/modules/auth/auth.service';
import BxApiResult from './models/bx.api.result';
import { Auth } from '../../common/modules/auth/model/entities/auth.entity';
import IBxApiCall from './models/intefaces/bx.api.call';
import IBxFolder from './models/intefaces/bx.folder';
import IBxApiResult from './models/intefaces/bx.api.result';
import IBxUser from './models/intefaces/bx.user';

/**
 * Service providing integration with Bitrix24 rest API:
 * - authorization actuality keep by refresh;
 * - single calls;
 * - batch calls;
 * - list calls;
 * - common operations for service users (e.g matching, task, etc)
 *
 * Requires client_id and client_secret of application purchased from vendors portal.
 *
 * @see AuthService
 * @see ConfigService
 * @see https://dev.1c-bitrix.ru/rest_help/users/index.php
 * @see https://vendors.bitrix24.com/
 */
@Injectable()
export class BxApiService {
    private readonly logger: Logger = new Logger(BxApiService.name);
    private readonly AUTH_API = axios.create({
        baseURL: 'https://oauth.bitrix.info/oauth/token/?grant_type=refresh_token',
    });

    constructor(@Inject(AuthService) private readonly auth: AuthService, @Inject(ConfigService) private readonly env: ConfigService) {}

    /**
     * Gets authentication data by client's Bitrix24 portal domain.
     * Refreshes `access_token` if auth found and is active.
     * @param domain - client's Bitrix24 portal domain.
     * @returns Auth - authentication data
     * @see Auth
     */
    async getAuth(domain: string): Promise<Auth> {
        const auth = await this.auth.getByDomain(domain);
        return await this.refreshAuth(auth);
    }

    /**
     * Gets active authentication data.
     * Shortcut for getAuth except it returns null for found but inactive auth.
     * @param domain - client's Bitrix24 portal domain.
     * @see Auth
     * @see getAuth
     */
    async getActiveAuth(domain: string): Promise<Auth | null> {
        try {
            const auth = await this.getAuth(domain);
            return auth.active ? auth : null;
        } catch (e) {
            this.logger.error({ domain, message: 'Failed to get auth by domain ' });
            return null;
        }
    }

    /**
     * Gets current `access_token` owner user.
     * @param auth - authentication data.
     * @see Auth
     * @see callBXApi
     * @see https://dev.1c-bitrix.ru/rest_help/users/user_current.php
     */
    async getCurrentUser(auth: Auth): Promise<IBxUser> {
        return (await this.callBXApi<IBxUser>(auth, { method: 'user.current', data: {} })).data;
    }

    /**
     * Gets available scopes for application.
     * @param auth - authentication data.
     * @see Auth
     * @see callBXApi
     * @see https://dev.1c-bitrix.ru/rest_help/general/scope.php
     */
    async getScopes(auth: Auth): Promise<string[]> {
        return (await this.callBXApi<string[]>(auth, { method: 'scope', data: {} })).data;
    }

    /**
     * Refreshes `access_token` if expired.
     * @param auth - authentication data.
     * @see Auth
     */
    async refreshAuth(auth: Auth) {
        if (auth.expires > new Date().valueOf()) return auth;

        const params = {
            client_id: this.env.get('CLIENT_ID'),
            client_secret: this.env.get('CLIENT_SECRET'),
            refresh_token: auth.refresh_token,
        };

        const response = (await this.AUTH_API.get('', { params })).data;

        auth.auth_token = response.access_token;
        auth.refresh_token = response.refresh_token;
        auth.expires = response.expires * 1000;
        await this.auth.save(auth);
        return auth;
    }

    /**
     * Executes single call to Bitrix24 rest API.
     * Refreshes `access_token` before call.
     * NOTE: for list methods gets only first page; use getList instead.
     * Logs requests and responses to debug level.
     * @param auth - authentication data.
     * @param call - call to execute.
     * @returns IBxApiResult - Bitrix24 rest API response.
     * @see Auth
     * @see IBxApiCall
     * @see IBxApiResult
     * @see refreshAuth
     * @see getList
     */
    async callBXApi<T>(auth: Auth, call: IBxApiCall): Promise<IBxApiResult<T>> {
        auth = await this.refreshAuth(auth);
        try {
            const resp = (
                await axios.post(`https://${auth.domain}/rest/${call.method}.json`, {
                    ...call.data,
                    auth: auth.auth_token,
                    start: -1,
                })
            ).data;

            this.logger.debug({
                domain: auth.domain,
                member_id: auth.member_id,
                message: `Method: ${call.method}\nData: ${JSON.stringify(call.data)}\nResponse: ${JSON.stringify(resp)}`,
            });

            const result = new BxApiResult<T>();
            if (resp.result) {
                result.data = resp.result as T;
            }
            if (resp.error) {
                result.error = resp.error;
            }

            return result;
        } catch (e) {
            this.logger.error({
                domain: auth.domain,
                member_id: auth.member_id,
                message: 'Failed to execute request',
                err: e?.response?.data ?? (e?.stack || e?.message),
            });
            throw e;
        }
    }

    /**
     * Executes batch of calls to Bitrix24 rest API.
     * Splits batch by 50 calls (API limit).
     * Refreshes `access_token` before call.
     * Recursive: if some list methods in batch has more elements to request recall method with current results.
     * Logs requests and responses to debug level.
     * @param auth - authentication data.
     * @param calls - calls batch to execute.
     * @param prev - previous result, used when requesting more list results.
     * @returns IBxApiResult - Bitrix24 rest API response.
     * @see Auth
     * @see IBxApiCall
     * @see IBxApiResult
     * @see BxApiResult
     * @see refreshAuth
     */
    async callBXBatch(auth: Auth, calls: IBxApiCall[], prev = new BxApiResult<any>()): Promise<IBxApiResult<any>> {
        if (!calls.length) return new BxApiResult();

        const result = prev;
        const next = [];

        for (const part of chunk(calls, 50)) {
            const [logPart, logAllowed] = BxApiService.excludeFileContent(part);
            this.logger.debug({ domain: auth.domain, message: ['Batch calls before transform: ', JSON.stringify(logPart)] });

            const cmd = {};
            part.forEach((call, idx) => {
                cmd[call.id ?? `call_${idx}`] = `${call.method}?${this.getQuery({ start: call.start, ...call.data })}`;
            });

            if (logAllowed) {
                this.logger.debug({
                    domain: auth.domain,
                    message: ['Batch calls: ', ...Object.keys(cmd).map((key) => `${key}: ${cmd[key]}`)].join('\n'),
                });
            }

            try {
                auth = await this.refreshAuth(auth);
                const resp = (
                    await axios.post(`https://${auth.domain}/rest/batch.json`, {
                        cmd,
                        halt: 0,
                        auth: auth.auth_token,
                    })
                ).data;

                this.logger.debug({ domain: auth.domain, message: 'Batch response: ' + JSON.stringify(resp) });

                Object.keys(resp.result.result ?? {}).forEach((key) => {
                    if (!result.result[key]) {
                        result.result[key] = resp.result.result[key];
                    } else if (Array.isArray(resp.result.result[key]) && Array.isArray(result.result[key])) {
                        result.result[key] = result.result[key].concat(resp.result.result[key]);
                    }
                });

                Object.keys(resp.result.result_error ?? {}).forEach((key) => {
                    result.errors[key] = resp.result.result_error[key];
                });

                if (Object.keys(resp.result.result_next ?? {}).length) {
                    const partMap = keyBy(part, 'id');
                    Object.keys(resp.result.result_next).forEach((key) => {
                        partMap[key].start = resp.result.result_next[key];
                        next.push(partMap[key]);
                    });
                }
            } catch (e) {
                this.logger.error({ message: 'Failed to execute batch', err: e?.response?.data ?? (e?.stack || e?.message) });
                throw e;
            }
        }

        return next.length ? await this.callBXBatch(auth, next, result) : result;
    }

    /**
     * Executes single list call to Bitrix24 rest API.
     * Refreshes `access_token` before call.
     * Loads all list by 50 elements (API limit).
     * Uses list call optimization.
     * Logs requests and responses to debug level.
     * @param auth - authentication data.
     * @param call - call to execute.
     * @returns IBxApiResult - Bitrix24 rest API response.
     * @see Auth
     * @see IBxApiCall
     * @see IBxApiResult
     * @see refreshAuth
     * @see https://dev.1c-bitrix.ru/rest_help/rest_sum/start.php
     */
    async getList<T>(auth: Auth, call: IBxApiCall): Promise<IBxApiResult<T[]>> {
        if (call.method.indexOf('list') < 0 && call.method.indexOf('get') < 0) throw new Error('Trying to list non-list method: ' + call.method);

        auth = await this.refreshAuth(auth);
        try {
            if (!call.data.filter && !call.data.FILTER) {
                call.data.filter = {};
            }

            const filterField = !call.data.filter ? 'FILTER' : 'filter';
            const idField = call.method.includes('crm.item') ? 'id' : 'ID';

            call.data[filterField][`>${idField}`] = 0;
            const listData = {
                auth: auth.auth_token,
                start: -1,
                order: {
                    [idField]: 'ASC',
                },
            };
            let resp = (
                await axios.post(`https://${auth.domain}/rest/${call.method}.json`, {
                    ...call.data,
                    ...listData,
                })
            ).data;

            this.logger.debug({
                domain: auth.domain,
                member_id: auth.member_id,
                message: `Method: ${call.method}\nData: ${JSON.stringify(call.data)}\nResponse: ${JSON.stringify(resp)}`,
            });

            const result = new BxApiResult<T[]>();
            if (resp.error) {
                result.error = resp.error;
                return result;
            }

            const list = (resp.result?.items ?? resp.result?.types ?? resp.result) as T[];
            result.data = list;

            let nextId = list?.[49]?.[idField] ?? null;
            while (nextId) {
                await this.refreshAuth(auth);
                listData.auth = auth.auth_token;

                call.data[filterField][`>${idField}`] = nextId;
                resp = (
                    await axios.post(`https://${auth.domain}/rest/${call.method}.json`, {
                        ...call.data,
                        ...listData,
                    })
                ).data;

                this.logger.debug({
                    domain: auth.domain,
                    member_id: auth.member_id,
                    message: `Method: ${call.method}\nData: ${JSON.stringify(call.data)}\nResponse: ${JSON.stringify(resp)}`,
                });

                if (resp.error) {
                    result.error = resp.error;
                    return result;
                }

                const nextPart = resp.result.items ?? resp.result.types ?? resp.result ?? [];
                result.data = result.data.concat(nextPart as T[]);
                nextId = nextPart[49]?.[idField] ?? null;
            }

            return result;
        } catch (e) {
            this.logger.error({
                domain: auth.domain,
                member_id: auth.member_id,
                message: 'Failed to execute request',
                err: e?.response?.data ?? (e?.stack || e?.message),
            });
            throw e;
        }
    }

    /**
     * Generates CRM entity map grouped by `filterField`.
     * Map values contain entity identifier and `filterField` property.
     * @param auth - authentication data.
     * @param entity - CRM entity code.
     * @param filterField - property name to group by and filter by.
     * @param filterValue - value to filter by.
     * @param entityTypeId - entityTypeId of smart process (optional).
     * @returns Record<string,any> - entity map.
     * @see Auth
     * @see getMap
     * @see https://dev.1c-bitrix.ru/rest_help/crm/index.php
     * @see https://dev.1c-bitrix.ru/rest_help/crm/dynamic/index.php
     */
    async getCRMMap(auth: Auth, entity: string, filterField: string, filterValue: string[], entityTypeId?: string);
    /**
     * Generates CRM entity map grouped by `filterField`.
     * Map values contain entity identifier, `filterField` property and `auxFields` properties.
     * @param auth - authentication data.
     * @param entity - CRM entity code.
     * @param filterField - property name to group by and filter by.
     * @param filterValue - value to filter by.
     * @param auxFields - additional property names list to load.
     * @param entityTypeId - entityTypeId of smart process (optional).
     * @returns Record<string,any> - entity map.
     * @see Auth
     * @see getMap
     * @see https://dev.1c-bitrix.ru/rest_help/crm/index.php
     * @see https://dev.1c-bitrix.ru/rest_help/crm/dynamic/index.php
     */
    async getCRMMap(auth: Auth, entity: string, filterField: string, filterValue: string[], auxFields: string[], entityTypeId?: string);
    async getCRMMap(auth: Auth, entity: string, filterField: string, filterValue: string[], auxFieldsOrEntityTypeId: string[] | string, entityTypeId?: string) {
        return Array.isArray(auxFieldsOrEntityTypeId)
            ? this.getMap(auth, `crm.${entity}.list`, filterField, filterValue, auxFieldsOrEntityTypeId, entityTypeId)
            : this.getMap(auth, `crm.${entity}.list`, filterField, filterValue, [], auxFieldsOrEntityTypeId);
    }

    /**
     * Generates CRM entity map grouped by `filterField`.
     * Map values contain entity identifier, `filterField` property and `auxFields` properties.
     * NOTE: work properly only with list methods supporting payload as:
     * `{ select: string[], filter: Record<string, any>, entityTypeId?: number }`
     * @param auth - authentication data.
     * @param method - Bitrix24 rest API method.
     * @param filterField - property name to group by and filter by.
     * @param filterValue - value to filter by.
     * @param auxFields - additional property names list to load.
     * @param entityTypeId - entityTypeId of smart process (optional).
     * @returns Record<string,any> - entity map.
     * @see Auth
     * @see getList
     * @see https://dev.1c-bitrix.ru/rest_help/rest_sum/start.php
     */
    async getMap(auth: Auth, method: string, filterField: string, filterValue: string[], auxFields: string[] = [], entityTypeId?: string) {
        return filterValue.length
            ? keyBy(
                  (
                      await this.getList(auth, {
                          method,
                          data: {
                              select: [entityTypeId ? 'id' : 'ID', filterField, ...auxFields],
                              filter: { [`=${filterField}`]: filterValue },
                              entityTypeId,
                          },
                      })
                  ).data,
                  filterField,
              )
            : {};
    }

    /**
     * Encodes and transforms Bitrix24 rest API call payload to supported format.
     * Recursive.
     * @param obj - payload data.
     * @param prefix - property path.
     * @returns string - encoded data.
     * @see encodeURIComponent
     * @private
     */
    private getQuery(obj: any, prefix = '{0}'): string {
        if (obj === null) {
            return '';
        } else if (typeof obj === 'object' && !(obj instanceof Date)) {
            let str = '';
            for (const key in obj) {
                str += `${this.getQuery(obj[key], `${prefix.replace('{0}', key)}[{0}]`)}`;
            }
            return str;
        } else {
            if (obj instanceof Date) {
                obj = obj.toJSON();
            }
            return `&${prefix.replace('[{0}]', '')}=${encodeURIComponent(String(obj))}`;
        }
    }

    /**
     * Gets or creates folder in Bitrix24 portal workgroup.
     * @param auth - authentication data.
     * @param folder - Bitrix24 API folder data.
     * @returns string - folder id.
     * @see getFolderId
     * @see createSubFolder
     * @see https://dev.1c-bitrix.ru/rest_help/disk/index.php
     */
    async getSubFolderId(auth: Auth, folder: IBxFolder): Promise<string> {
        const folderId = await this.getFolderId(auth, folder.id, folder.data.NAME);
        if (folderId) {
            return folderId;
        }
        return this.createSubFolder(auth, folder);
    }

    /**
     * Looks for folder in workgroup.
     * @param auth - authentication data.
     * @param folderId - parent folder id.
     * @param folderName - folder name.
     * @returns string|null - folder identifier if found.
     * @see Auth
     * @see callBXApi
     * @see https://dev.1c-bitrix.ru/rest_help/disk/folder/disk_folder_getchildren.php
     */
    async getFolderId(auth: Auth, folderId: string, folderName: string): Promise<string | null> {
        const result = await this.callBXApi(auth, {
            method: 'disk.folder.getchildren',
            data: {
                id: folderId,
                filter: {
                    NAME: BxApiService.normalizeFileNameName(folderName),
                },
            },
        });

        if (result.error) {
            this.logger.error({ domain: auth.domain, member_id: auth.member_id, message: 'Failed to find folder', payload: { error: result.error } });
            return null;
        }

        return result.data?.[0]?.ID ?? null;
    }

    /**
     * Creates new folder in workgroup.
     * @param auth - authentication data.
     * @param folder - folder data.
     * @returns string|null - created folder id or null if error occurred.
     * @see Auth
     * @see IBxFolder
     * @see callBXApi
     * @see https://dev.1c-bitrix.ru/rest_help/disk/folder/disk_folder_addsubfolder.php
     */
    async createSubFolder(auth: Auth, folder: IBxFolder): Promise<string | null> {
        const result = await this.callBXApi<{ ID: string }>(auth, {
            method: 'disk.folder.addsubfolder',
            data: {
                id: folder.id,
                data: {
                    NAME: BxApiService.normalizeFileNameName(folder.data.NAME),
                },
            },
        });

        if (result.error) {
            this.logger.error({ domain: auth.domain, member_id: auth.member_id, message: 'Failed to create folder', payload: { error: result.error } });
            return null;
        }

        return result.data.ID;
    }

    /**
     * Normalize file or folder name.
     * Replaces out disallowed symbols with '_'
     * @param fileName - original file name.
     * @returns string - correct file name.
     * @private
     */
    private static normalizeFileNameName(fileName: string): string {
        try {
            return fileName.replace(new RegExp(/[:;/\\№#]/, 'g'), '_');
        } catch (e) {
            throw new Error(JSON.stringify(e));
        }
    }

    /**
     * Excludes files from data to log by `fileContent` property existence.
     * @param calls - calls to log.
     * @returns [IBxApiCall[], boolean] - calls to log and flag tells whether file content is in calls.
     * @see IBxApiCall
     * @private
     * @static
     */
    private static excludeFileContent(calls: IBxApiCall[]): [IBxApiCall[], boolean] {
        const result = [];
        let logAllowed = true;
        for (const call of calls) {
            if (!call.data.fileContent) {
                result.push(call);
            } else {
                logAllowed = false;
                result.push({
                    id: call.id,
                    method: call.method,
                    data: { ...Object.fromEntries(Object.entries(call.data).filter(([key]) => key !== 'fileContent')) },
                });
            }
        }
        return [result, logAllowed];
    }
}
