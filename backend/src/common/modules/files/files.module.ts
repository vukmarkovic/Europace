import { Global, Module } from '@nestjs/common';
import FileDownloader from './file.downloader';

/**
 * Module providing service to download files from external URIs.
 * @see FileDownloader
 */
@Global()
@Module({
    providers: [FileDownloader],
    exports: [FileDownloader],
})
export default class FilesModule {}
