export enum GameEvent {
  GAME_START          = 'game:start',
  GAME_OVER           = 'game:over',
  GAME_PAUSE          = 'game:pause',
  GAME_RESUME         = 'game:resume',
  PLAYER_HIT          = 'player:hit',
  PLAYER_RESPAWN      = 'player:respawn',
  DIFFICULTY_CHANGED  = 'difficulty:changed',
  SCORE_UPDATED       = 'score:updated',
}

class EventBus {
    private listeners: Record<string, Function[]> = {};

    on(event: GameEvent, fn: Function): void {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(fn);
    }

    off(event: GameEvent, fn: Function): void {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(f => f !== fn);
    }

    once(event: GameEvent, fn: Function): void {
        const wrapper = (payload?: unknown) => {
            fn(payload);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    emit(event: GameEvent, payload?: unknown): void {
        this.listeners[event]?.forEach(fn => fn(payload));
    }

    clear(): void {
        this.listeners = {};
    }
}

export const EventEmitter = new EventBus();