import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AccountAuthService } from 'src/account/accountAuth.service';

@Injectable()
export class AuthAdminGuard implements CanActivate {
  constructor(private readonly accountAuthService: AccountAuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const cookie = request.headers.authorization;
    if (cookie) {
      const user = await this.accountAuthService.getAccountInfo(cookie);
      if (user && user.type === 'admin') {
        return true;
      } else {
        throw new Error('没有权限');
      }
    }
    throw new Error('未登录');
  }
}
