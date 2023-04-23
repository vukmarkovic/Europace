import * as moment from 'moment';
import { getLastRunDateRFC } from '../../../../src/modules/task/utils';

describe('Task utils', () => {
    describe('getLastRunDateRFC', () => {
        it('should convert given date', () => {
            const date = new Date('2022-01-02T03:04:05+03:00');
            expect(getLastRunDateRFC(date)).toEqual('2022-01-02T01:04:05');
        });

        it('should use default date', () => {
            expect(moment().utcOffset(1).add(-1, 'd').format()).toStartWith(getLastRunDateRFC());
        });
    });
});
