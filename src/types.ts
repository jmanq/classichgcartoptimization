export interface TrayType {
  name: string;
  tod: {
    width: number;
    length: number;
  };
  count: number;
}

export interface PotSize {
  size: string;
  trays: TrayType[];
}

export interface TrayPosition {
  x: number;
  y: number;
  isVertical: boolean;
  trayWidth: number;
  trayLength: number;
}

export interface LayoutResult {
  trayType: TrayType;
  totalTrays: number;
  totalPots: number;
  positions: TrayPosition[];
  shelfWidth: number;
  shelfLength: number;
}

export type TabType = 'classic' | 'stadium' | '3d' | 'custom';

export interface CustomTray {
  name: string;
  width: number;
  length: number;
  count: number;
}

export interface SavedLayout {
  id: string;
  name: string;
  result: LayoutResult;
  dateAdded: Date;
}