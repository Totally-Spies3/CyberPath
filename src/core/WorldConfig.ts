import { GameEvent ,  EventEmitter} from './EventBus';

export interface WorldConfigData {
    worldSpeed: number;      // 2 → 14
    obstacleDensity: number; // 0.15 → 1.0
    obstacleTypes: string[];
}


const DEFAULTS = {
  worldSpeed:      2,
  obstacleDensity: 0.2,
  obstacleTypes:   ['ring'] as string[],
};

class WorldConfigClass {

  private _worldSpeed:      number   = DEFAULTS.worldSpeed;
  private _obstacleDensity: number   = DEFAULTS.obstacleDensity;
  private _obstacleTypes:   string[] = [...DEFAULTS.obstacleTypes];

  // Getters - lecture publique
    get worldSpeed(): number {
        return this._worldSpeed;
    }

    get obstacleDensity(): number {
        return this._obstacleDensity;
    }

    get obstacleTypes(): readonly string[] {
        return this._obstacleTypes;
    }

    // Version objet pour faciliter la lecture
    getAll(): Readonly<WorldConfigData> {
        return {
            worldSpeed: this._worldSpeed,
            obstacleDensity: this._obstacleDensity,
            obstacleTypes: [...this._obstacleTypes],
        };
    }

  // Remet les valeurs initiales — appelé sur game:over
  reset(): void {
    this._worldSpeed      = DEFAULTS.worldSpeed;
    this._obstacleDensity = DEFAULTS.obstacleDensity;
    this._obstacleTypes   = [...DEFAULTS.obstacleTypes];

    EventEmitter.emit(GameEvent.DIFFICULTY_CHANGED, this.getAll());
  }

  // DifficultyController seulement
  apply(patch: Partial<WorldConfigClass>): void {
    let changed = false;

    if (patch.worldSpeed  !== undefined) {
      if (patch.worldSpeed !== this._worldSpeed) changed = true;
      this._worldSpeed  = patch.worldSpeed;

    }

    if (patch.obstacleDensity !== undefined) {
      if (patch.obstacleDensity !== this._obstacleDensity) changed = true;
      this._obstacleDensity = patch.obstacleDensity;
    }

    if (patch.obstacleTypes !== undefined) {
      if (JSON.stringify(patch.obstacleTypes) !== JSON.stringify(this._obstacleTypes)) changed = true;
      this._obstacleTypes   = [...patch.obstacleTypes];
    }

    if (changed) {
      EventEmitter.emit(GameEvent.DIFFICULTY_CHANGED, this.getAll());
    }
  }

}

export const WorldConfig = new WorldConfigClass();