import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {UserInfoService} from "../../../services/user-info.service";
import {firstValueFrom} from "rxjs";

// Auth guard to protect routes that require authentication
export const authGuard: CanActivateFn = async (route, state) => {
  const userService = inject(UserInfoService);
  const router = inject(Router);

  try {
    const userInfo = await firstValueFrom(userService.loadUserInfo());

    if (userInfo) {
      return true;
    } else {
      return router.createUrlTree(['/auth']);
    }
  } catch (error) {
    console.error('Error loading user info in authGuard:', error);
    return router.createUrlTree(['/auth'])
  }
};
