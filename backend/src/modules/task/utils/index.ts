import * as moment from 'moment';

/**
 * Converts given date to RFC format date string.
 * Sets UTC offset used by Turista ERP API: +1 hour.
 * If given date undefined, uses -1 day from now date.
 * @param date - task last run date, may be undefined.
 * @returns string - RFC date string without offset.
 */
export function getLastRunDateRFC(date?: Date): string {
    if (!date) {
        const now = moment();
        now.add(-1, 'd');
        date = now.toDate();
    }
    return moment(date).utcOffset(1).format().substring(0, 19);
}
