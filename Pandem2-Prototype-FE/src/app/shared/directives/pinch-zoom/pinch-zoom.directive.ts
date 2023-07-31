/* ! Copyright Clarisoft, a Modus Create Company, 21/07/2023, licensed under the EUPL-1.2 or later. This open-source code is licensed following the Attribution 4.0 International (CC BY 4.0) - Creative Commons — Attribution 4.0 International — CC BY 4.0.
  Following this, you are accessible to:
  Share - copy and redistribute the material in any medium or format.
  Adapt - remix, transform, and build upon the material commercially.
  Remark: The licensor cannot revoke these freedoms if you follow the license terms.
  Under the following terms:
  Attribution - You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so reasonably but not in any way that suggests the licensor endorses you or your use.
  No additional restrictions - You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits. */

import { Directive, ElementRef, HostListener, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { clamp } from 'lodash';

interface Transform { scale: number, pointX: number, pointY: number, rotate: number }

@Directive({
  selector: '[app-pinch-zoom]'
})
export class PinchZoomDirective implements OnInit {
  @Input() scaleFactor: number = 0.08;
  @Input() zoomThreshold: number = 9;
  @Input() initialZoom: number = 5;
  @Input() debounceTime: number = 100; // in ms
  @Input() rotationEnabled: boolean = true;
  @Input() changeTransformOrigin: boolean = false;
  @Input() thresholdBuffer: number = 0;
  @Output() pinch$: Subject<Transform> = new Subject<Transform>();
  od: number;
  scale: number = 1;
  start: { x: number; y: number } = { x: 0, y: 0 };
  move: { x: number; y: number } = { x: 0, y: 0 };
  rDeg: number = 0;
  orDeg: number = 0;
  panning: boolean = false;
  pointX: number = 0;
  pointY: number = 0;
  origin: { x: number, y: number };
  private readonly hostElement: HTMLElement;

  constructor(el: ElementRef) {
    this.hostElement = el.nativeElement;
    this.origin = { x: this.hostElement.offsetWidth / 2, y: this.hostElement.offsetHeight / 2 };
  }
  ngOnInit(): void {
    this.scale = this.initialZoom;
  }

  reset() {
    this.scale = 1;
    this.start = { x: 0, y: 0 };
    this.origin = { x: 0, y: 0 };
    this.move = { x: 0, y: 0 };
    this.rDeg = 0;
    this.orDeg = 0;
    this.pointX = 0;
    this.pointY = 0;
    this.od = 0;
    this.setRotationOrigin();
  }


  setRotationOrigin() {
    if (this.changeTransformOrigin) {
      const imgElements = this.hostElement.getElementsByTagName('img');
      if (imgElements.length) {

        const angle = -this.rDeg * Math.PI / 180;

        const image = imgElements.item(0);
        const deg = this.rDeg;
        this.rDeg = 0;
        const scale = this.scale,
          container = this.hostElement,
          imageData = image.getBoundingClientRect(),
          viewportData = this.hostElement.getBoundingClientRect(),
          top = (viewportData.top - imageData.top) + (viewportData.height / 2),
          left = (viewportData.left - imageData.left) + (viewportData.width / 2);

        const bx = left / scale;
        const by = top / scale;

        const npx = (bx - this.origin.x);
        const npy = (by - this.origin.y);

        const x = npx * Math.cos(angle) - npy * Math.sin(angle);
        const y = npx * Math.sin(angle) + npy * Math.cos(angle);
        const cx = this.origin.x + x;
        const cy = this.origin.y + y;

        this.pointX = container.offsetWidth / 2 - cx;
        this.pointY = container.offsetHeight / 2 - cy;
        image.style.transformOrigin = `${cx}px ${cy}px`;
        this.rDeg = deg;
      }
    }
    this.pinch$.next({ scale: this.scale, pointX: this.pointX, pointY: this.pointY, rotate: this.rDeg });
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onMouseDown($event) {
    if ($event.target.tagName !== 'IMG') {
      return;
    }
    $event.preventDefault();
    let pageX = $event.pageX;
    let pageY = $event.pageY;
    if ($event.touches) {
      pageX = $event.touches[0].pageX;
      pageY = $event.touches[0].pageY;
    }
    this.move.x = this.pointX || this.move.x;
    this.move.y = this.pointY || this.move.y;
    this.start.x = pageX - this.move.x;
    this.start.y = pageY - this.move.y;
    this.panning = true;


    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('touchmove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('touchend', this.onMouseUp);
  }

  onMouseUp = () => {
    document.removeEventListener('touchmove', this.onMouseMove);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('touchend', this.onMouseUp);

    this.od = 0;
    this.orDeg = 0;
    this.setRotationOrigin();
    this.panning = false;


  };

  onMouseMove = ($event) => {
    if (!this.panning) {
      return;
    }
    $event.preventDefault();

    let pageX = $event.pageX;
    let pageY = $event.pageY;
    if ($event.touches) {
      pageX = $event.touches[0].pageX;
      pageY = $event.touches[0].pageY;
    }
    if ($event.touches && $event.touches.length > 1) {
      const second_touches = $event.touches[1];
      const y = pageX - second_touches.pageX;
      const x = pageY - second_touches.pageY;

      if (this.rotationEnabled) {
        const deg = 90 - Math.atan2(y, x) * 180 / Math.PI;
        if (!this.orDeg) {
          this.orDeg = deg - this.rDeg;
        }
        this.rDeg = deg - this.orDeg;
      }

      const touches_dist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
      if (!this.od) {
        this.od = touches_dist / this.scale;
      }
      this.scale = touches_dist / this.od;
    } else {
      this.pointX = pageX - this.start.x;
      this.pointY = pageY - this.start.y;
    }
    this.pinch$.next({ scale: this.scale, pointX: this.pointX, pointY: this.pointY, rotate: this.rDeg });
  };

  // Every other browser
  @HostListener('wheel', ['$event'])
  onWheel($event: WheelEvent) {
    $event.preventDefault();
    this.calculatePinch( -$event.deltaY);
  }

  // Safari
  @HostListener('gesturestart', ['$event'])
  @HostListener('gesturechange', ['$event'])
  @HostListener('gestureend', ['$event'])
  onGesture($event: any) {

    $event.preventDefault();
    const pinchAmount = $event.scale - 1;
    this.calculatePinch(pinchAmount);
  }

  calculatePinch(deltaY: number) {
    let scale = this.scale;
    if (deltaY > 0) {
      (scale *= 1 + this.scaleFactor);
    } else {
      (scale /= 1 + this.scaleFactor);
    }
    scale = clamp(scale, 1, this.zoomThreshold + this.thresholdBuffer);
    this.scale = scale;

    this.pinch$.next({ scale: this.scale, pointX: this.pointX, pointY: this.pointY, rotate: this.rDeg });
  }

}
