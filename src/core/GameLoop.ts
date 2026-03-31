import { Engine } from '@babylonjs/core';
import { Scene } from '@babylonjs/core';

type UpdateFn = (dt: number) => void;

class GameLoopClass {

  private systems: UpdateFn[] = [];
  private running = false;

  // Enregistrer un système dans la boucle de jeu
  register(fn: UpdateFn): void {
    this.systems.push(fn);
  }

  // Démarrer la boucle de jeu
  start(engine: Engine, scene: Scene): void {
    if (this.running) return;
    this.running = true;

    engine.runRenderLoop(() => {
      // on divise par 1000 pour avoir des secondes
      const dt  = engine.getDeltaTime() / 1000;

      // Si le PC lag, on plafonne à 50ms pour éviter que les objets se téléportent
      const safeDt = Math.min(dt, 0.05);

      // Appel de tous les systèmes dans l'ordre
      for (const system of this.systems) system(safeDt);

      scene.render();
    });
  }

  // Arrêter la boucle de jeu
  stop(engine: Engine): void {
    this.running = false;
    engine.stopRenderLoop();
  }

  // Mettre en pause la boucle de jeu (sans vider les systèmes)
  pause(engine: Engine): void {
    this.running = false;
    engine.stopRenderLoop();
  }

  // Reprendre la boucle de jeu après une pause
  resume(engine: Engine, scene: Scene): void {
    if (this.running) return;
    this.start(engine, scene);
  }

}

export const GameLoop = new GameLoopClass();