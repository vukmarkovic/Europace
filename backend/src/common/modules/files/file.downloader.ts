import { constants, promises as fs } from 'fs';
import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid4 } from 'uuid';
import { Auth } from '../auth/model/entities/auth.entity';
import axios from 'axios';
import { ErrorHandler } from '../errorhandler/error.handler.service';

/**
 * Service providing methods to download files from external sources.
 */
@Injectable()
export default class FileDownloader {
    private readonly logger = new Logger(FileDownloader.name);

    constructor(private readonly errorHandler: ErrorHandler) {}

    /**
     * Downloads file by URL to temp location and returns it base64 encoded.
     * Removes temp file.
     * @param auth - auth data.
     * @param downloadUrl - file URL.
     * @returns base64 string file representation.
     * @throws InternalServerErrorException if operation failed.
     * @see ErrorHandler
     */
    async downloadFile(auth: Auth, downloadUrl: string): Promise<string | null> {
        if (!downloadUrl) return null;

        try {
            await fs.access('temp', constants.W_OK);
        } catch (err) {
            await fs.mkdir('temp');
        }

        const tmpFilePath = `temp/${uuid4()}`;
        try {
            this.logger.debug({ message: 'downloading file by url: ' + downloadUrl, domain: auth.domain });
            const response = await axios.get(downloadUrl, {
                responseType: 'blob',
            });
            await fs.writeFile(tmpFilePath, response.data);
            return await fs.readFile(tmpFilePath, { encoding: 'base64' });
        } catch (e) {
            this.errorHandler.internal({ auth, message: 'Failed to download file', e });
        } finally {
            try {
                await fs.access(tmpFilePath, constants.W_OK);
                await fs.unlink(tmpFilePath);
            } catch (err) {
                this.logger.error({ domain: auth.domain, member_id: auth.member_id, err });
            }
        }
    }
}
