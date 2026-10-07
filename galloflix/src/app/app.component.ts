import { afterNextRender, Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly isLoading = signal(true);
  readonly isScrolled = signal(false);

  constructor() {
    afterNextRender(() => {
      window.setTimeout(() => this.isLoading.set(false), 500);
    });
  }

  @HostListener('document:scroll')
  onDocumentScroll(): void {
    this.isScrolled.set(window.scrollY > 100);
  }
}