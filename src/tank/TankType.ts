import { TankColor } from './TankColor';
import { TankParty } from './TankParty';
import { TankTier } from './TankTier';

export class TankType {
  public readonly party: TankParty;
  public color: TankColor;
  public tier: TankTier;

  constructor(party: TankParty, color: TankColor, tier: TankTier) {
    this.party = party;
    this.color = color;
    this.tier = tier;
  }

  public clone(): TankType {
    return new TankType(this.party, this.color, this.tier);
  }

  public setColor(color: TankColor): this {
    this.color = color;

    return this;
  }

  public increaseTier(): this {
    switch (this.tier) {
      case TankTier.A:
        this.tier = TankTier.B;
        break;
      case TankTier.B:
        this.tier = TankTier.C;
        break;
      case TankTier.C:
        this.tier = TankTier.D;
      default:
        break;
    }

    return this;
  }

  public isMaxTier(): boolean {
    return this.tier === TankTier.D;
  }

  public static PlayerPrimaryA = new TankType(
    TankParty.Player,
    TankColor.Primary,
    TankTier.A,
  );
  public static PlayerPrimaryB = new TankType(
    TankParty.Player,
    TankColor.Primary,
    TankTier.B,
  );
  public static PlayerPrimaryC = new TankType(
    TankParty.Player,
    TankColor.Primary,
    TankTier.C,
  );
  public static PlayerPrimaryD = new TankType(
    TankParty.Player,
    TankColor.Primary,
    TankTier.D,
  );
  public static EnemyDefaultA = new TankType(
    TankParty.Enemy,
    TankColor.Default,
    TankTier.A,
  );
  public static EnemyDefaultB = new TankType(
    TankParty.Enemy,
    TankColor.Default,
    TankTier.B,
  );
}