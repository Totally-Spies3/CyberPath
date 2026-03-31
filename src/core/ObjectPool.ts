export class ObjectPool<T> {

  private stock: T[]  = [];
  private factory: () => T; // indique comment fabriquer les objets 

  constructor(factory: () => T, initialSize: number) {
    this.factory = factory;

    // Pré-remplit le stock au démarrage
    for (let i = 0; i < initialSize; i++) {
      this.stock.push(factory());
    }
  }

  // Prendre un objet dans le stock ou en créer un nouveau si le stock est vide 
  acquire(): T {
    if (this.stock.length === 0) return this.factory();
    return this.stock.pop()!;
  }

  // Remettre un objet dans le stock
  release(item: T): void {
    this.stock.push(item);
  }

  // Nombre d'objets disponibles
  get availableCount(): number {
    return this.stock.length;
  }

}