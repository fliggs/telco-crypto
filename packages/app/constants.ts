export enum Spacing {
  SMALL = 8,
  MEDIUM = 20,
  LARGE = 40,
}

const SPACING = new Set<string | null | undefined>(
  Object.values(Spacing).map((v) => v.toString())
);
export function getSpacing(spacing: string | null | undefined, def: Spacing) {
  return (
    Spacing[spacing as unknown as keyof typeof Spacing] ??
    (SPACING.has(spacing) ? Number(spacing) : def)
  );
}

export enum Color {
  PRIMARY = "#00FFFF",
  PRIMARY_DARK = "#004444",
  DARK = "#232323",
  BLACK = "#000000",
  WHITE = "#FFFFFF",
  GRAY = "#F0F0F0",
  PETROL = "#00FF00",
  RED = "#FF0000",
  DARK_GRAY = "#8C8C8C",
}

const COLORS = new Set<string | null | undefined>(Object.values(Color));
export function getColor(color: string | null | undefined, def: Color) {
  return (
    Color[color as unknown as keyof typeof Color] ??
    (COLORS.has(color) ? color : def)
  );
}

export const TAB_HEIGHT = 75;
