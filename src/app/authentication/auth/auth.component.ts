import {HttpClient} from '@angular/common/http';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TUI_VALIDATION_ERRORS, TuiFieldErrorPipeModule, TuiInputModule, TuiInputPasswordModule} from '@taiga-ui/kit';
import {
  TuiAlertService,
  TuiButtonModule,
  TuiErrorModule,
  TuiLinkModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import {AsyncPipe, NgClass, NgIf, NgOptimizedImage} from '@angular/common';
import {AuthService} from './auth.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AppConstants} from '../../app.constants';
import {environment} from '../../../environments/environment';
import {NgxParticlesModule} from '@tsparticles/angular'; // Keep this for the component
import {ParticlesService} from '../../services/particles.service'; // Import your service

declare const google: any;

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    TuiInputModule,
    TuiErrorModule,
    TuiInputPasswordModule,
    ReactiveFormsModule,
    TuiFieldErrorPipeModule,
    AsyncPipe,
    TuiButtonModule,
    NgIf,
    TuiLinkModule,
    TuiTextfieldControllerModule,
    NgOptimizedImage,
    NgxParticlesModule,
    NgClass,
    RouterLink,
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.less'],
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        required: 'Value is required',
        email: 'Invalid email address',
        minlength: ({requiredLength, actualLength}: { requiredLength: number; actualLength: number }) =>
          `Password is too short: ${actualLength}/${requiredLength} characters`,
      },
    },
  ],
})
export class AuthComponent implements OnInit {
  greetings: { [key: string]: string } = {};
  currentGreeting: string = Object.keys(this.greetings)[0];
  currentLanguage: string = this.greetings[this.currentGreeting];
  isHovering: boolean = false;
  isSignUp: boolean = false;
  minimumPasswordLength: number = 6;
  isRotating: boolean = false;

  private readonly TERMS_OF_USE_PATH = '/terms-of-use';
  private readonly PRIVACY_POLICY_PATH = '/privacy-policy';
  termsOfUseUrl: string = `${environment.feUrl}${this.TERMS_OF_USE_PATH}`;
  privacyPolicyUrl: string = `${environment.feUrl}${this.PRIVACY_POLICY_PATH}`;

  authForm = new FormGroup({
    emailValue: new FormControl('', [Validators.required, Validators.email]),
    passwordValue: new FormControl('', [Validators.required, Validators.minLength(this.minimumPasswordLength)]),
  });

  id = 'tsparticles';
  particlesOptions$ = this.particlesService.particlesOptions$;
  private clientId = environment.googleClientId;

  constructor(
    private authService: AuthService,
    private alertService: TuiAlertService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    protected particlesService: ParticlesService,
    private http: HttpClient
  ) {
  }

  initializeGoogleSignIn() {
    const handleResponse = this.handleCredentialResponse.bind(this);

    google.accounts.id.initialize({
      client_id: this.clientId,
      callback: handleResponse,
    });

    // Automatically prompt the popup on page load
    google.accounts.id.prompt();
    console.log('Google Sign-In initialized');
  }

  handleCredentialResponse(response: any) {
    this.isRotating = true;
    const credential = response.credential;

    this.http.post(AppConstants.GOOGLE_ONE_TAP_VERIFY_URL, {token: credential}, {withCredentials: true})
      .subscribe({
        next: () => {
          this.router.navigate(['/home']).then(r => r); // Redirect after successful auth
        },
        error: () => {
          console.error('Error during login', response);
          this.isRotating = false;
        },
      });
  }

  ngOnInit(): void {
    this.loadGoogleSignInScript().then(() => {
      this.initializeGoogleSignIn();
    });

    this.particlesService.initializeParticles();

    this.route.fragment.subscribe((fragment) => {
      if (fragment === 'sign-up') {
        this.isSignUp = true;
      } else if (fragment === 'sign-in') {
        this.isSignUp = false;
      }
    });

    this.loadGreetings();

    setInterval(() => {
      if (!this.isHovering && Object.keys(this.greetings).length > 0) {
        const greetingKeys = Object.keys(this.greetings);
        this.currentGreeting = greetingKeys[Math.floor(Math.random() * greetingKeys.length)];
        this.currentLanguage = this.greetings[this.currentGreeting];
        this.cdr.detectChanges();
      }
    }, 2000);
  }

  private loadGreetings(): void {
    this.http.get<{ [key: string]: string }>('/assets/greetings.json').subscribe(
      (data) => {
        this.greetings = data;

        // Initialize currentGreeting and currentLanguage after data is loaded
        const greetingKeys = Object.keys(this.greetings);
        if (greetingKeys.length > 0) {
          this.currentGreeting = greetingKeys[0];
          this.currentLanguage = this.greetings[this.currentGreeting];
        }
      },
      (error) => {
        console.error('Error loading greetings:', error);
      }
    );
  }

  onSubmit() {
    if (this.authForm.valid) {
      this.isRotating = true;
      const emailValue = this.authForm.get('emailValue')?.value!;
      const passwordValue = this.authForm.get('passwordValue')?.value!;

      if (this.isSignUp) {
        this.authService.register(emailValue, passwordValue).subscribe({
          next: (response) => {
            this.alertService
              .open(response.message || 'Next step, verify your email!', {status: 'success'})
              .subscribe();
          },
          error: (error) => {
            this.alertService.open(error.error.message || 'Registration failed', {status: 'error'}).subscribe();
            this.isRotating = false;
          },
        });
      } else {
        this.authService.login(emailValue, passwordValue).subscribe({
          next: () => {
            this.router.navigate(['/home']).then((r) => r);
          },
          error: (error) => {
            this.alertService.open(error.error.message || 'Login failed', {status: 'error'}).subscribe();
            1
          },
        });
      }
    }
  }

  private loadGoogleSignInScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined') {
        resolve();  // Script is already loaded
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
          console.log('Google Sign-In script loaded');
          resolve();
        };
        script.onerror = () => reject('Google Sign-In script could not be loaded.');
        document.head.appendChild(script);
      }
    });
  }

  toggleSignUp() {
    this.isSignUp = !this.isSignUp;
  }

  onForgotPassword() {
    const emailValue = this.authForm.get('emailValue')?.value!;
    if (!emailValue) {
      this.alertService.open('Please enter your email address', {status: 'error'}).subscribe();
      return;
    }
    this.authService.forgotPassword(emailValue).subscribe({
      next: (response) => {
        this.alertService.open(response.message || 'Password reset link sent!', {status: 'success'}).subscribe();
      },
      error: (error) => {
        this.alertService
          .open(error.error.message || 'Failed to send password reset link', {status: 'error'})
          .subscribe();
      },
    });
  }

  onSocialLogin(provider: string) {
    this.isRotating = true;
    let url = '';
    switch (provider) {
      case 'google':
        url = AppConstants.GOOGLE_AUTH_URL;
        break;
      case 'apple':
        url = AppConstants.APPLE_AUTH_URL;
        break;
    }
    window.location.href = url;
  }

  // Hovering over the greeting
  onMouseEnter() {
    this.isHovering = true;
  }

  onMouseLeave() {
    this.isHovering = false;
  }
}
