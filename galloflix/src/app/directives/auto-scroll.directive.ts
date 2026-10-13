import { Directive, ElementRef, OnDestroy, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[autoScroll]',
  host: {
    '(mouseleave)': 'onMouseLeave()',
    '(mousedown)': 'onMouseDown($event)',
    '(mouseup)': 'onMouseUp()',
    '(mousemove)': 'onMouseMove($event)',
    '(wheel)': 'onWheel($event)',
  },
})
export class AutoScrollDirective implements OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly decay = 0.95;
  private readonly scrollMargin = 200;
  private readonly autoScrollSpeed = 10;

  private isDragging = false;
  private startX = 0;
  private initialScrollLeft = 0;
  private velocity = 0;
  private lastScrollTime = 0;
  private animationFrameId: number | null = null;
  private autoScrollInterval: ReturnType<typeof setInterval> | null = null;
  private currentScrollStep = 0;

  onMouseLeave(): void {
    this.isDragging = false;
    this.stopAutoScroll();
    this.resetCursor();
    this.applyInertia();
  }

  onMouseDown(event: MouseEvent): void {
    const element = this.elementRef.nativeElement;

    this.isDragging = true;
    this.startX = event.pageX - element.offsetLeft;
    this.initialScrollLeft = element.scrollLeft;
    this.lastScrollTime = performance.now();
    this.stopAutoScroll();
    this.resetCursor();
    this.cancelAnimation();
  }

  onMouseUp(): void {
    this.isDragging = false;
    this.stopAutoScroll();
    this.applyInertia();
  }

  onMouseMove(event: MouseEvent): void {
    const element = this.elementRef.nativeElement;

    if (!this.isDragging) {
      this.checkForAutoScroll(event);
      return;
    }

    event.preventDefault();

    const x = event.pageX - element.offsetLeft;
    const walk = (x - this.startX) * 2;
    const targetScrollLeft = this.initialScrollLeft - walk;
    const now = performance.now();
    const deltaTime = now - this.lastScrollTime;

    if (deltaTime > 0) {
      this.velocity = (targetScrollLeft - element.scrollLeft) / deltaTime;
    }

    this.lastScrollTime = now;
    element.scrollLeft = targetScrollLeft;
  }

  onWheel(event: WheelEvent): void {
    if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
      return;
    }

    this.elementRef.nativeElement.scrollLeft += event.deltaY * 2;
    event.preventDefault();
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
    this.cancelAnimation();
    this.resetCursor();
  }

  private checkForAutoScroll(event: MouseEvent): void {
    const element = this.elementRef.nativeElement;
    const rect = element.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const canScrollLeft = element.scrollLeft > 0;
    const canScrollRight = element.scrollLeft < element.scrollWidth - rect.width - 1;

    if (mouseX < this.scrollMargin && canScrollLeft) {
      this.setCursor("url('/img/arrow-left.png') 16 16, w-resize");
      this.startAutoScroll(-this.autoScrollSpeed);
      return;
    }

    if (mouseX > rect.width - this.scrollMargin && canScrollRight) {
      this.setCursor("url('/img/arrow-right.png') 16 16, e-resize");
      this.startAutoScroll(this.autoScrollSpeed);
      return;
    }

    this.stopAutoScroll();
    this.resetCursor();
  }

  private startAutoScroll(step: number): void {
    if (this.autoScrollInterval !== null && this.currentScrollStep === step) {
      return;
    }

    this.stopAutoScroll();
    this.currentScrollStep = step;

    this.autoScrollInterval = setInterval(() => {
      const element = this.elementRef.nativeElement;
      element.scrollLeft += step;

      const reachedLeft = step < 0 && element.scrollLeft <= 0;
      const reachedRight = step > 0 && element.scrollLeft >= element.scrollWidth - element.clientWidth - 1;

      if (reachedLeft || reachedRight) {
        this.stopAutoScroll();
        this.resetCursor();
      }
    }, 16);
  }

  private stopAutoScroll(): void {
    if (this.autoScrollInterval !== null) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }

    this.currentScrollStep = 0;
  }

  private setCursor(cursor: string): void {
    this.renderer.setStyle(this.elementRef.nativeElement, '--auto-scroll-cursor', cursor);
  }

  private resetCursor(): void {
    this.renderer.removeStyle(this.elementRef.nativeElement, '--auto-scroll-cursor');
  }

  private applyInertia(): void {
    if (Math.abs(this.velocity) < 0.1 || this.isDragging) {
      this.velocity = 0;
      return;
    }

    this.elementRef.nativeElement.scrollLeft += this.velocity * 16;
    this.velocity *= this.decay;
    this.animationFrameId = requestAnimationFrame(() => this.applyInertia());
  }

  private cancelAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.velocity = 0;
  }
}