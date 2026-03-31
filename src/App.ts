import { GameLoop }                from './core/GameLoop';
import { EventEmitter, GameEvent } from './core/EventBus';
import { SceneManager }            from './managers/SceneManager';
import { CameraManager }           from './managers/CameraManager';
import { Engine, Scene }           from '@babylonjs/core';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

// ── Engine d'abord ───────────────────────────────────────
const engine = new Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
});

// ── Scene ensuite — DANS le callback whenInitialized ─────
const scene = new Scene(engine);

SceneManager.init(scene);
CameraManager.init(scene);

// Resize
window.addEventListener('resize', () => engine.resize());

// GameLoop
EventEmitter.on(GameEvent.GAME_START,  () => GameLoop.start(engine, scene));
EventEmitter.on(GameEvent.GAME_PAUSE,  () => GameLoop.pause(engine));
EventEmitter.on(GameEvent.GAME_RESUME, () => GameLoop.resume(engine, scene));
EventEmitter.on(GameEvent.GAME_OVER,   () => GameLoop.stop(engine));

// Test temporaire
EventEmitter.emit(GameEvent.GAME_START);

