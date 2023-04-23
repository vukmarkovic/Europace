import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Gets authentication data from request.
 * Auth provided by guard.
 * @see InstallationGuard
 * @see RobotGuard
 */
const Auth = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.auth;
});

export default Auth;
