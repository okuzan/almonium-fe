import {Component, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {catchError, map} from 'rxjs/operators';
import {of} from 'rxjs';
import {FormsModule} from "@angular/forms";
import {ContenteditableValueAccessorModule} from '@tinkoff/angular-contenteditable-accessor';
import {DiscoverService} from "./discover.service";
import {TuiBadgeModule} from "@taiga-ui/kit";

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
    TuiBadgeModule
  ],
  standalone: true,
})
export class DiscoverComponent implements OnInit, OnDestroy {
  @Input() searchText: string = '';
  filteredOptions: string[] = [];
  currentFocus: number = -1;
  frequency: number = 0;

  private globalKeydownListener!: () => void;

  constructor(private http: HttpClient,
              private discoverService: DiscoverService,
              private renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.globalKeydownListener = this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
      if (event.key === '/') {
        this.focusSearchInput();
        event.preventDefault(); // Prevent the default action
      }
    });
  }

  ngOnDestroy(): void {
    if (this.globalKeydownListener) {
      this.globalKeydownListener();
    }
  }

  focusSearchInput(): void {
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

  onSubmit(): void {
    console.log('onSubmit');
    this.filteredOptions = [];
    this.discoverService.search(this.searchText).subscribe(data => {
      this.frequency = data;
    });
  }

  onSearchChange(searchText: string): void {
    this.currentFocus = -1;
    if (searchText && searchText.length >= 3) {
      const apiUrl = `https://api.datamuse.com/sug?k=demo&s=${searchText}&max=5`;
      this.http.get<{ word: string }[]>(apiUrl).pipe(
        map((data: { word: string }[]) => data.map(item => item.word)),
        catchError(() => of([]))
      ).subscribe(options => {
        this.filteredOptions = options;
      });
    } else {
      this.filteredOptions = [];
    }
  }

  onOptionSelected(option: string): void {
    this.searchText = option;
    this.filteredOptions = [];

    this.focusSearchInput();
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      this.currentFocus++;
      if (this.currentFocus >= this.filteredOptions.length) {
        this.currentFocus = 0;
      }
    } else if (event.key === 'ArrowUp') {
      this.currentFocus--;
      if (this.currentFocus < 0) {
        this.currentFocus = this.filteredOptions.length - 1;
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.currentFocus > -1 && this.currentFocus < this.filteredOptions.length) {
        this.onOptionSelected(this.filteredOptions[this.currentFocus]);
      }
      this.onSubmit();
    } else if (event.key === 'Escape') {
      this.filteredOptions = [];
      this.currentFocus = -1;
      const element = this.renderer.selectRootElement('.search-input', true);
      if (element) {
        element.blur();
      }
    }
  }

  isOptionFocused(index: number): boolean {
    return this.currentFocus === index;
  }
}