import {Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
import {NgIf, NgOptimizedImage} from "@angular/common";
import {DismissButtonComponent} from "../elements/dismiss-button/dismiss-button.component";

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [
    NgIf,
    NgOptimizedImage,
    DismissButtonComponent
  ],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" *ngIf="isVisible">
      <div class="bg-white rounded-3xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-7 relative">
        <app-dismiss-button (close)="onClose()"></app-dismiss-button>
        <div class="flex items-center mb-4 flex-row">
          <img ngSrc="../../../../assets/img/icons/alert-triangle.svg" alt="Warning Icon" class="icon" height="512"
               width="512" style="width: 20px; height: 20px; margin-right: 6px; margin-top: 2px">
          <h2 class="text-xl font-bold ml-0.5">{{ title }}</h2>
        </div>
        <p class="text-gray-700 mb-6 mt-6 text-sm">{{ message }}</p>
        <div class="flex justify-between">
          <button (click)="onClose()" class="text-gray-950 underline font-bold hover:underline ">Cancel</button>
          <button (click)="onConfirm()" [disabled]="isButtonDisabled"
                  class="bg-red-500 text-white px-4 py-2 font-bold rounded-3xl hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {{ isButtonDisabled ? 'Proceed in ' + countdown : confirmText }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmModalComponent implements OnChanges, OnDestroy {
  @Input() isVisible: boolean = false;
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmText: string = 'Delete Account';
  @Input() useCountdown: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  countdown: number = 5;
  isButtonDisabled: boolean = true;
  intervalId: any;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVisible'] && changes['isVisible'].currentValue === true) {
      if (this.useCountdown) {
        this.resetCountdown();
      } else {
        this.isButtonDisabled = false;
      }
    } else if (changes['isVisible'] && changes['isVisible'].currentValue === false) {
      this.clearCountdown();
    }
  }

  resetCountdown() {
    this.clearCountdown();
    this.countdown = 5;
    this.isButtonDisabled = true;

    this.intervalId = setInterval(() => {
      this.countdown--;

      if (this.countdown === 0) {
        this.isButtonDisabled = false;
        this.clearCountdown();
      }
    }, 1000);
  }

  clearCountdown() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onClose() {
    this.close.emit();
  }

  onConfirm() {
    this.confirm.emit();
    this.clearCountdown();
  }

  ngOnDestroy() {
    this.clearCountdown();
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(_: KeyboardEvent) {
    if (this.isVisible) {
      this.onClose();
    }
  }
}
