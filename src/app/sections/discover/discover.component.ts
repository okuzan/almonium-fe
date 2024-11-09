import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild,} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {catchError, map} from 'rxjs/operators';
import {of} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {ContenteditableValueAccessorModule} from '@tinkoff/angular-contenteditable-accessor';
import {TuiBadgeModule} from '@taiga-ui/kit';
import {ActivatedRoute} from '@angular/router';
import {FrequencyService} from '../../services/frequency.service';
import {NavbarComponent} from '../../shared/navbars/navbar/navbar.component';
import {Language} from '../../models/language.enum';
import {LanguageService} from '../../services/language.service';
import {NavbarWrapperComponent} from '../../shared/navbars/navbar-wrapper/navbar-wrapper.component';
import {DiacriticPopupComponent} from './diacritic-popup/diacritic-popup.component';
import {DiacriticService} from "./diacritic-popup/diacritic.service";

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.less'],
  imports: [
    NgForOf,
    NgIf,
    FormsModule,
    NgOptimizedImage,
    ContenteditableValueAccessorModule,
    TuiBadgeModule,
    NgClass,
    NavbarComponent,
    NavbarWrapperComponent,
    DiacriticPopupComponent,
  ],
  standalone: true,
})
export class DiscoverComponent implements OnInit, OnDestroy, AfterViewInit {
  // Diacritic popup
  @ViewChild('diacriticPopup') diacriticPopup!: DiacriticPopupComponent;
  @ViewChild('searchInput') searchInput!: ElementRef;
  protected popupOptions: string[] = [];
  protected popupPosition = {top: '0px', left: '0px'};
  protected diacriticPopupFocusIndex = -1;
  private diacriticPopupFocused: boolean = false;
  private previousSearchText: string = '';

  @Input() searchText: string = '';
  filteredOptions: string[] = [];
  currentAutocompleteItemFocusIndex: number = -1;
  frequency: number = 0;
  submitted: boolean = false;
  currentLanguage: Language = Language.EN;

  private globalKeydownListener!: () => void;

  constructor(
    private http: HttpClient,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private frequencyService: FrequencyService,
    private languageService: LanguageService,
    private diacriticService: DiacriticService
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchText = params['text'] || '';
      if (this.searchText) {
        this.onSearchChange(this.searchText);
      }
    });

    this.globalKeydownListener = this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
      if (event.key === '/') {
        this.focusSearchInput();
        event.preventDefault();
      }
    });

    this.languageService.currentLanguage$.subscribe(currentLanguage => {
      if (currentLanguage) {
        this.currentLanguage = currentLanguage;
      }
    });
  }

  ngAfterViewInit() {
    // Listen for paste events to sanitize pasted content
    this.renderer.listen(this.searchInput.nativeElement, 'paste', (event: ClipboardEvent) => {
      event.preventDefault(); // Prevent the default paste behavior
      const text = event.clipboardData?.getData('text/plain') || ''; // Get plain text from the clipboard
      this.insertTextAtCursor(text); // Insert the plain text at the cursor position
    });
  }

  ngOnDestroy(): void {
    if (this.globalKeydownListener) {
      this.globalKeydownListener();
    }
  }

  /** Utility method to insert text at the cursor position in a contenteditable element */
  private insertTextAtCursor(text: string): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selection.deleteFromDocument(); // Remove any selected text
      selection.getRangeAt(0).insertNode(document.createTextNode(text)); // Insert the plain text
    }
  }

  private focusSearchInput(): void {
    const element = this.renderer.selectRootElement('.search-input', true);
    if (element) {
      element.focus();

      // Move cursor to the end after focusing
      const range = document.createRange();
      const selection = window.getSelection();

      if (selection) {
        range.selectNodeContents(element);
        range.collapse(false); // Move cursor to the end
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }

  private onSubmit(): void {
    this.submitted = true;
    this.filteredOptions = [];
    if (this.searchText) {
      this.frequencyService.getFrequency(this.searchText, this.currentLanguage).subscribe(freq => {
        this.frequency = freq;
      });
    }
  }

  private clearDiactrics(): void {
    this.popupOptions = [];
    this.diacriticPopupFocusIndex = -1;
    this.diacriticPopupFocused = false;
  }

  /** Handles changes in the search input field */
  protected onSearchChange(searchText: string): void {
    const {previousText, currentText, changeIndex} = this.trackTextChanges();

    if (this.searchText !== previousText && this.diacriticPopupFocused) {
      this.clearDiactrics();
    }

    if (changeIndex !== null) {
      let lastChar: string | undefined;

      if (changeIndex < currentText.length) {
        lastChar = currentText[changeIndex];
      } else if (currentText.length > 0) {
        lastChar = currentText[currentText.length - 1];
      }

      if (lastChar) {
        const languageOptions = this.diacriticService.getDiacriticOptions(lastChar, this.currentLanguage);

        if (languageOptions.length > 0) {
          this.popupOptions = languageOptions;
          this.positionPopupAtCursorPosition();
        } else {
          this.clearDiactrics();
        }
      } else {
        this.clearDiactrics();
      }
    } else {
      this.clearDiactrics();
    }

    // Update previousSearchText after processing
    this.previousSearchText = currentText;

    this.submitted = false;
    this.currentAutocompleteItemFocusIndex = -1;

    if (searchText && searchText.length >= 3 && this.currentLanguage === Language.EN) {
      const apiUrl = `https://api.datamuse.com/sug?k=demo&s=${searchText}&max=5`;
      this.http
        .get<{ word: string }[]>(apiUrl)
        .pipe(
          map((data: { word: string }[]) => data.map(item => item.word).slice(0, 5)), // Ensure only 5 suggestions
          catchError(() => of([]))
        )
        .subscribe(options => {
          if (!this.submitted) {
            this.filteredOptions = options;
          }
        });
    } else {
      this.filteredOptions = [];
    }
  }

  protected onOptionSelected(option: string): void {
    this.searchText = option;
    this.onSubmit();
    this.fixCaret();
  }

  // DIACRITIC POPUP HANDLERS

  /** Tracks changes between the previous and current text input */
  private trackTextChanges(): { previousText: string; currentText: string; changeIndex: number | null } {
    const currentText = (this.searchInput.nativeElement.textContent || '').replace(/\u00A0/g, ' ');
    const previousText = this.previousSearchText;
    const changeIndex = this.diacriticService.findChangeIndex(previousText, currentText);
    return {previousText, currentText, changeIndex};
  }

  /** Positions the diacritic popup at the cursor's position */
  private positionPopupAtCursorPosition(): void {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0).cloneRange();
      range.collapse(false);

      const rect = range.getBoundingClientRect();

      // Retrieve font size of the parent element (assuming popup is relative to the input field)
      const fontSize = parseFloat(window.getComputedStyle(range.startContainer.parentElement as Element).fontSize);

      let topOffset;
      let leftOffset;

      if (fontSize < 30) {
        topOffset = fontSize * 1.3;
        leftOffset = fontSize * 0.6;
      } else {
        topOffset = 35;
        leftOffset = 35;
      }
      this.popupPosition = {
        top: `${rect.top + window.scrollY - topOffset}px`,
        left: `${rect.right + window.scrollX - leftOffset}px`,
      };
    }
  }

  /** Handles the selection of a diacritic character */
  protected selectDiacritic(diacritic: string): void {
    if (!this.diacriticPopupFocused) {
      return;
    }

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // Adjust the range to select the character before the caret
      if (range.startOffset > 0) {
        // If there are characters before the caret, move the range start back by one character
        range.setStart(range.startContainer, range.startOffset - 1);
      } else {
        // If the caret is at the very beginning, try to find the previous text node
        const previousNode = this.getPreviousTextNode(range.startContainer);
        if (previousNode) {
          // Set the range to the last character of the previous text node
          const length = previousNode.textContent?.length || 0;
          range.setStart(previousNode, length - 1);
          range.setEnd(previousNode, length);
        }
      }

      // Remove the character before the caret (the one we want to replace with the diacritic)
      range.deleteContents();

      // Insert the diacritic character in place of the deleted character
      const textNode = document.createTextNode(diacritic);
      range.insertNode(textNode);

      // Move the caret to just after the newly inserted diacritic character
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    this.clearDiactrics();

    // Update `previousSearchText` to reflect the new text content of the input
    this.previousSearchText = (this.searchInput.nativeElement.textContent || '').replace(/\u00A0/g, ' ');
  }

  /** Helper function to get the previous text node relative to the current node */
  private getPreviousTextNode(node: Node): Node | null {
    let currentNode: Node | null = node;
    while (currentNode) {
      if (currentNode.previousSibling) {
        currentNode = currentNode.previousSibling;
        if (currentNode.nodeType === Node.TEXT_NODE) {
          return currentNode;
        }
      } else {
        currentNode = currentNode.parentNode;
      }
    }
    return null;
  }

  private movePopupFocus(direction: 'up' | 'down'): void {
    if (this.popupOptions.length > 0) {
      if (direction === 'up') {
        this.diacriticPopupFocusIndex = (this.diacriticPopupFocusIndex + 1) % this.popupOptions.length;
      } else {
        this.diacriticPopupFocusIndex = (this.diacriticPopupFocusIndex - 1 + this.popupOptions.length) % this.popupOptions.length;
      }
    }
  }

  private setCursorToEnd(): void {
    const element = this.searchInput.nativeElement;
    const range = document.createRange();
    const selection = window.getSelection();

    // Ensure there is content in the element before setting the cursor
    if (element.childNodes.length > 0 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
      range.setStart(element.childNodes[0], element.innerText.length);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    } else if (element.childNodes.length === 0) {
      // If there is no text node, create an empty text node to hold the cursor
      const textNode = document.createTextNode('');
      element.appendChild(textNode);
      range.setStart(textNode, 0);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }


  // KEYDOWN HANDLER
  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      if (this.currentAutocompleteItemFocusIndex <= 0) {
        if (this.diacriticPopupFocused) {
          event.preventDefault();
          this.movePopupFocus('down');
        }
      }
      this.currentAutocompleteItemFocusIndex++;
      if (this.currentAutocompleteItemFocusIndex >= this.filteredOptions.length) {
        this.currentAutocompleteItemFocusIndex = 0;
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.currentAutocompleteItemFocusIndex <= 0) {
        if (!this.diacriticPopupFocused) {
          this.diacriticPopupFocused = true;
        }
        if (this.popupOptions.length === 1) {
          this.selectDiacritic(this.popupOptions[0]);
        } else {
          this.movePopupFocus('up');
        }
      }
      this.currentAutocompleteItemFocusIndex--;
      if (this.currentAutocompleteItemFocusIndex < 0) {
        this.currentAutocompleteItemFocusIndex = this.filteredOptions.length - 1;
      }
    } else if (event.key === 'ArrowLeft') {
      if (this.popupOptions.length > 0) {
        event.preventDefault();
        this.movePopupFocus('down');
        return;
      }
    } else if (event.key === 'ArrowRight') {
      if (this.popupOptions.length > 0) {
        event.preventDefault();
        this.movePopupFocus('up');
        return;
      }
    } else if (event.key === 'Enter') {
      event.preventDefault(); // no new line, just submit
      if (this.popupOptions.length > 0) {
        if (this.diacriticPopupFocused) {
          this.selectDiacritic(this.popupOptions[this.diacriticPopupFocusIndex]);
          return;
        } else {
          this.clearDiactrics();
        }
      }

      if (
        this.currentAutocompleteItemFocusIndex > -1 &&
        this.currentAutocompleteItemFocusIndex < this.filteredOptions.length
      ) {
        this.onOptionSelected(this.filteredOptions[this.currentAutocompleteItemFocusIndex]);
      }
      this.onSubmit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      if (this.popupOptions.length > 0) {
        this.clearDiactrics();
        return;
      }
      this.filteredOptions = [];
      this.currentAutocompleteItemFocusIndex = -1;
      const element = this.renderer.selectRootElement('.search-input', true);
      if (element) {
        element.blur();
      }
    } else if (event.key === ' ') {
      if (this.popupOptions.length > 0) {
        if (this.diacriticPopupFocused) {
          this.selectDiacritic(this.popupOptions[this.diacriticPopupFocusIndex]);
          return;
        } else {
          this.clearDiactrics();
        }
      }
    }
  }

  private fixCaret() {
    setTimeout(() => {
      this.setCursorToEnd();
    }, 0);
  }

  protected isOptionFocused(index: number): boolean {
    return this.currentAutocompleteItemFocusIndex === index;
  }

  protected getGaussianGradient(frequency: number): string {
    const startHue = 160;
    const endHue = 280;
    const hue = startHue + (endHue - startHue) * (frequency / 100);

    const startColor = `hsl(${hue}, 80%, 60%)`;
    const endColor = `hsl(${hue + 60}, 90%, 40%)`;

    return `linear-gradient(45deg, ${startColor} 0%, ${endColor} 100%)`;
  }

  protected getFrequencyLabel(frequency: number): string {
    if (frequency <= 20) return 'Extremely Rare';
    if (frequency <= 30) return 'Pretty Rare';
    if (frequency <= 40) return 'Challenging';
    if (frequency <= 75) return 'Comfort Zone';
    return 'Essential';
  }

  protected getFrequencyDescription(frequency: number): string {
    if (frequency <= 20) return 'Too rare to be useful';
    if (frequency <= 30) return 'Learn if need to';
    if (frequency <= 40) return 'Ideal candidate';
    if (frequency <= 75) return 'You probably know it';
    return 'Top 50 words';
  }
}
