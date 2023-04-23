import * as winston from 'winston';
import moment = require('moment');
import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

const logFormat = winston.format.printf(({ level, message, timestamp, durationMs, err, member_id, domain, payload }) => {
    let log =
        `\n[${level}] ${moment(timestamp).utcOffset(3).format('YYYY-MM-DD HH:mm:ss')}\n${message}` +
        `\nmember_id: ${member_id}` +
        `\ndomain: ${domain}` +
        `${durationMs ? '\nDuration: ' + durationMs / 1000 + 's' : ''}` +
        `${err ? '\n' + JSON.stringify(err) : ''}`;

    if (payload && typeof payload === 'object') {
        Object.keys(payload).forEach((key) => {
            log += `\n${key}: ${JSON.stringify(payload[key])}`;
        });
    }

    return log;
});

/**
 * Module providing global logger format.
 */
@Global()
@Module({
    imports: [
        WinstonModule.forRoot({
            level: 'debug',
            format: winston.format.combine(winston.format.timestamp(), logFormat),
            transports: [
                new winston.transports.DailyRotateFile({
                    filename: 'logs/server-%DATE%.log',
                    maxSize: '20m',
                    maxFiles: '14d',
                    zippedArchive: true,
                }),
                new winston.transports.DailyRotateFile({
                    filename: 'logs/error-%DATE%.log',
                    level: 'error',
                    handleExceptions: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    zippedArchive: true,
                }),
                new winston.transports.Console({
                    format: winston.format.simple(),
                    level: 'error',
                }),
            ],
            exitOnError: false,
        }),
    ],
})
export default class LoggerModule {}
