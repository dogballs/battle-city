export class Rect {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public clone(): Rect {
    return new Rect(this.x, this.y, this.width, this.height);
  }
}
