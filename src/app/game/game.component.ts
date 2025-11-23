import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameEngineService } from './game-engine.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-container">
      <canvas #rendererCanvas id="renderCanvas"></canvas>
      <div class="ui-overlay">
        <h1>Vomiting Game</h1>
        <p class="desktop-controls"><strong>SPACE</strong> = Vomit! | <strong>Arrow Keys</strong> = Look Around</p>
        <p class="mobile-controls"><strong>Drag</strong> to look | <strong>Tap button</strong> to vomit</p>
        <p>Score: {{ gameEngine.score }}</p>
      </div>
      <div class="crosshair">+</div>
      <button class="vomit-button" (click)="onVomitButton()">
        🤮 VOMIT
      </button>
    </div>
  `,
  styles: [`
    .game-container {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      touch-action: none;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
    .ui-overlay {
      position: absolute;
      top: 20px;
      left: 20px;
      color: white;
      font-family: sans-serif;
      pointer-events: none;
      text-shadow: 2px 2px 4px #000000;
    }
    .desktop-controls {
      display: block;
    }
    .mobile-controls {
      display: none;
    }
    .crosshair {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 24px;
      pointer-events: none;
      user-select: none;
    }
    .vomit-button {
      position: fixed;
      bottom: max(20px, env(safe-area-inset-bottom));
      left: 50%;
      transform: translateX(-50%);
      padding: 15px 30px;
      font-size: 20px;
      font-weight: bold;
      background: linear-gradient(135deg, #00ff00, #00aa00);
      color: white;
      border: 3px solid white;
      border-radius: 50px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 255, 0, 0.5);
      display: none;
      z-index: 1000;
      touch-action: manipulation;
    }
    .vomit-button:active {
      transform: translateX(-50%) scale(0.95);
      box-shadow: 0 2px 8px rgba(0, 255, 0, 0.7);
    }
    
    @media (max-width: 768px), (pointer: coarse) {
      .game-container {
        height: 100dvh;
      }
      .desktop-controls {
        display: none;
      }
      .mobile-controls {
        display: block;
      }
      .vomit-button {
        display: block;
        bottom: max(15px, calc(env(safe-area-inset-bottom) + 10px));
      }
      .ui-overlay {
        top: max(10px, env(safe-area-inset-top));
      }
      .ui-overlay h1 {
        font-size: 20px;
        margin: 5px 0;
      }
      .ui-overlay p {
        font-size: 12px;
        margin: 3px 0;
      }
    }
  `]
}) export class GameComponent implements OnInit {
  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(public gameEngine: GameEngineService) { }

  ngOnInit(): void {
    this.gameEngine.createScene(this.rendererCanvas);
    this.gameEngine.animate();
    this.setupTouchControls();
  }

  private setupTouchControls(): void {
    let lastTouchX = 0;
    let lastTouchY = 0;

    this.rendererCanvas.nativeElement.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 1) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      }
    });

    this.rendererCanvas.nativeElement.addEventListener('touchmove', (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - lastTouchX;
        const deltaY = e.touches[0].clientY - lastTouchY;

        this.gameEngine.rotateCamera(-deltaX * 0.005, -deltaY * 0.003);

        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.gameEngine.resize();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case ' ':
        event.preventDefault();
        this.gameEngine.vomit();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.gameEngine.rotateCamera(-0.1, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.gameEngine.rotateCamera(0.1, 0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.gameEngine.rotateCamera(0, -0.05);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.gameEngine.rotateCamera(0, 0.05);
        break;
    }
  }

  onVomitButton(): void {
    this.gameEngine.vomit();
  }
}
