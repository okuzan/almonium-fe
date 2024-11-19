import {TuiInputModule, TuiInputNumberModule, TuiTextfieldControllerModule} from "@taiga-ui/legacy";
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NavbarComponent} from "../../../shared/navbars/navbar/navbar.component";
import {SettingsTabsComponent} from "../tabs/settings-tabs.component";
import {
  FluentLanguageSelectorComponent
} from "../../../shared/fluent-language-selector/fluent-language-selector.component";
import {LanguageSetupService} from "../../../authentication/language-setup/language-setup.service";
import {Language} from "../../../models/language.model";
import {UserInfoService} from "../../../services/user-info.service";
import {UserInfo} from "../../../models/userinfo.model";
import {EditButtonComponent} from "../../../shared/edit-button/edit-button.component";
import {LanguageNameService} from "../../../services/language-name.service";
import {TuiAlertService} from "@taiga-ui/core";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {TuiChip} from "@taiga-ui/kit";
import {BehaviorSubject} from "rxjs";
import {LocalStorageService} from "../../../services/local-storage.service";

@Component({
  selector: 'app-lang-settings',
  standalone: true,
  imports: [
    FormsModule,
    NavbarComponent,
    ReactiveFormsModule,
    TuiInputModule,
    TuiInputNumberModule,
    TuiTextfieldControllerModule,
    SettingsTabsComponent,
    FluentLanguageSelectorComponent,
    EditButtonComponent,
    NgIf,
    NgForOf,
    TuiChip,
    AsyncPipe
  ],
  templateUrl: './lang-settings.component.html',
  styleUrl: './lang-settings.component.less'
})
export class LangSettingsComponent implements OnInit {
  protected userInfo: UserInfo | null = null;
  protected languages: Language[] = [];

  // fluent languages
  protected selectedFluentLanguages: string[] = [];
  protected currentFluentLanguages: string[] = [];
  protected fluentEditable: boolean = false;
  protected fluentEnabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(
    private languageService: LanguageSetupService,
    protected languageNameService: LanguageNameService,
    private userInfoService: UserInfoService,
    private alertService: TuiAlertService,
    private cdr: ChangeDetectorRef,
    private localStorageService: LocalStorageService,
  ) {
  }

  ngOnInit(): void {
    this.languageService.getLanguages().subscribe((languages) => {
      this.languages = languages;
      this.populateFromUserInfo();
    });
  }

  private populateFromUserInfo() {
    this.userInfoService.userInfo$.subscribe((info) => {
      this.userInfo = info;
      if (info) {
        this.selectedFluentLanguages = this.userInfo!.fluentLangs;
        this.currentFluentLanguages = this.languageNameService.mapLanguageCodesToNames(this.languages, this.selectedFluentLanguages);
        this.updateFluentEnabled();
      }
    });
  }

  private validateFluentLanguages() {
    return this.selectedFluentLanguages.length <= 3 && this.selectedFluentLanguages.length > 0;
  }

  private updateFluentEnabled(): void {
    const isEnabled =
      !this.fluentEditable ||
      (this.validateFluentLanguages() && !this.areStringArraysEqual(this.selectedFluentLanguages, this.currentFluentLanguages));

    Promise.resolve().then(() => {
      this.fluentEnabled$.next(isEnabled);
      this.cdr.detectChanges();
    });
  }

  private areStringArraysEqual(array1: string[], array2: string[]): boolean {
    if (array1.length !== array2.length) {
      return false;
    }

    // Create sorted copies of both arrays to compare
    const sortedArray1 = [...array1].sort();
    const sortedArray2 = [...array2].sort();

    // Compare sorted arrays element by element
    return sortedArray1.every((value, index) => value === sortedArray2[index]);
  }

  protected onFluentLanguagesSelected(selectedLanguages: string[]): void {
    this.selectedFluentLanguages = selectedLanguages;
    this.updateFluentEnabled();
  }

  protected onFluentEdit(): void {
    if (!this.fluentEditable) {
      this.fluentEditable = true;
      this.updateFluentEnabled();
      return;
    }

    if (!this.fluentEnabled$) {
      console.error('This should not happen: form is invalid but submit was called');
      return;
    }

    const fluentLanguageCodes = this.languageNameService.mapLanguageNamesToCodes(this.languages, this.selectedFluentLanguages);
    this.languageService.saveFluentLanguages({
      langCodes: fluentLanguageCodes,
    }).subscribe({
      next: () => {
        this.alertService.open('Fluent languages saved successfully', {appearance: 'success'}).subscribe();
        this.localStorageService.clearUserInfo();
        this.fluentEditable = false;
        this.currentFluentLanguages = this.selectedFluentLanguages;
      },
      error: (error) => {
        this.alertService.open(error.error.message || 'Failed to save fluent languages', {appearance: 'error'}).subscribe();
        this.fluentEditable = false;
        this.selectedFluentLanguages = this.currentFluentLanguages;
      },
    });
  }
}
