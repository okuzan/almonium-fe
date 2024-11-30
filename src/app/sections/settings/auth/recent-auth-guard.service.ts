import {Injectable} from '@angular/core';
import {AuthSettingsService} from "./auth-settings.service";
import {LocalStorageService} from "../../../services/local-storage.service";
import {TuiAlertService} from "@taiga-ui/core";
import {RecentAuthGuardStateService} from "../../../shared/recent-auth-guard/recent-auth-guard-state.service";

@Injectable({
  providedIn: 'root'
})
export class RecentAuthGuardService {
  private static readonly RECENT_LOGIN_CACHE_TIMESTAMP_KEY = 'recent_login_cache_timestamp';

  constructor(
    private settingService: AuthSettingsService,
    private alertService: TuiAlertService,
    private localStorageService: LocalStorageService,
    private recentAuthGuardStateService: RecentAuthGuardStateService,
  ) {
  }

  // universal live token auth guard
  public guardAction(onValidToken: () => void) {
    this.checkAuth(onValidToken, this.showIdentityVerificationPopup.bind(this));
  }

  public getRecentAuthStatus(onValidTokenAction?: () => void, identityVerification?: () => void): void {
    this.settingService.checkCurrentAccessTokenIsLive().subscribe({
      next: (expiresAt: string | null) => {
        if (expiresAt) {
          const expirationTime = new Date(expiresAt).getTime();
          this.localStorageService.saveItem(RecentAuthGuardService.RECENT_LOGIN_CACHE_TIMESTAMP_KEY, expirationTime);
          if (onValidTokenAction) {
            onValidTokenAction();
          }
        } else {
          this.localStorageService.removeItem(RecentAuthGuardService.RECENT_LOGIN_CACHE_TIMESTAMP_KEY);
          if (identityVerification) {
            identityVerification();
          }
        }
      },
      error: (error) => {
        this.alertService.open(error.message || 'Failed to check access token', {appearance: 'error'}).subscribe();
        console.error('Error checking access token:', error);
      }
    });
  }

  private getCachedResult(): boolean {
    const cacheTimestamp: number | null = this.localStorageService.getItem<number>(RecentAuthGuardService.RECENT_LOGIN_CACHE_TIMESTAMP_KEY);

    if (cacheTimestamp !== null && new Date().getTime() < cacheTimestamp) {
      return true;
    }
    this.localStorageService.removeItem(RecentAuthGuardService.RECENT_LOGIN_CACHE_TIMESTAMP_KEY);
    return false;
  }

  private showIdentityVerificationPopup() {
    this.alertService.open('To continue with this action, we need to verify your identity.', {appearance: 'info'}).subscribe();
    this.recentAuthGuardStateService.open();
  }

  private checkAuth(onValidTokenAction: () => void, identityVerification: () => void): void {
    console.log('Checking auth');
    const cachedResult: boolean = this.getCachedResult();
    console.log('Cached result:', cachedResult);
    if (!cachedResult) {
      console.log('Getting recent auth status');
      this.getRecentAuthStatus(onValidTokenAction, identityVerification);
    } else {
      console.log('Executing onValidTokenAction');
      onValidTokenAction();
    }
  }
}
