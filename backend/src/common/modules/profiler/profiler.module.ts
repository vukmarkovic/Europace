import { Global, Module } from '@nestjs/common';
import Profiler from './profiler.service';

/**
 * Module providing profiler to log execution time.
 * @see Profiler
 */
@Global()
@Module({
    providers: [Profiler],
    exports: [Profiler],
})
export default class ProfilerModule {}
