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
        <p><strong>SPACE</strong> = Vomit! | <strong>Arrow Keys</strong> = Look Around</p>
        <p>Score: {{ gameEngine.score }}</p>
      </div>
      <div class="crosshair">+</div>
    </div>
  `,
  styles: [`
    .game-container {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
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
  `]
})
export class GameComponent implements OnInit {
  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(public gameEngine: GameEngineService) { }

  ngOnInit(): void {
    this.gameEngine.createScene(this.rendererCanvas);
    this.gameEngine.animate();
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
}
