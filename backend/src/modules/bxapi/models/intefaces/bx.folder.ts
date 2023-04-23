/**
 * Interface representing folder description received from Bitrix24 rest API
 */
interface IBxFolder {
    id: string;
    data: {
        NAME: string;
    };
}

export default IBxFolder;
