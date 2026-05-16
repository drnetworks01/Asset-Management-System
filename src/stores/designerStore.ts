'use client';

import { create } from 'zustand';
import type { LocationShapeData } from '@/lib/db/schema';

export type DesignerRoom = {
  id: string;
  floorId: string;
  name: string;
  slug: string;
  shape: 'rect' | 'l_shape' | 'circle' | 'polygon';
  shapeData: LocationShapeData;
  color: string;
  icon: string | null;
  isNew?: boolean;
  isDeleted?: boolean;
};

type Snapshot = {
  rooms: Record<string, DesignerRoom>;
  selectedId: string | null;
};

type DesignerState = Snapshot & {
  mode: 'view' | 'design';
  history: Snapshot[];
  future: Snapshot[];
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;

  setMode: (mode: 'view' | 'design') => void;
  load: (rooms: DesignerRoom[]) => void;
  select: (id: string | null) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;

  updateRoom: (id: string, patch: Partial<DesignerRoom>) => void;
  moveRoom: (id: string, dx: number, dy: number) => void;
  resizeRoom: (
    id: string,
    next: { x?: number; y?: number; width: number; height: number },
  ) => void;
  rotateRoom: (id: string, rotation: number) => void;
  renameRoom: (id: string, name: string) => void;
  recolorRoom: (id: string, color: string) => void;
  addRoom: (
    shape: DesignerRoom['shape'],
    floorId: string,
    at: { x: number; y: number },
  ) => string;
  deleteRoom: (id: string) => void;

  undo: () => void;
  redo: () => void;
  reset: () => void;
  changedRooms: () => DesignerRoom[];
};

function pushHistory(state: DesignerState): Snapshot[] {
  const snap: Snapshot = {
    rooms: structuredClone(state.rooms),
    selectedId: state.selectedId,
  };
  const next = [...state.history, snap];
  return next.length > 50 ? next.slice(next.length - 50) : next;
}

const GRID = 20;

function snap(value: number, gridSize: number, enabled: boolean): number {
  return enabled ? Math.round(value / gridSize) * gridSize : Math.round(value);
}

export const useDesignerStore = create<DesignerState>((set, get) => ({
  mode: 'view',
  rooms: {},
  selectedId: null,
  history: [],
  future: [],
  showGrid: true,
  snapToGrid: true,
  gridSize: GRID,

  setMode: (mode) => set({ mode, selectedId: null }),

  load: (rooms) => {
    const map: Record<string, DesignerRoom> = {};
    for (const r of rooms) map[r.id] = r;
    set({ rooms: map, history: [], future: [], selectedId: null });
  },

  select: (id) => set({ selectedId: id }),

  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

  updateRoom: (id, patch) =>
    set((s) => ({
      history: pushHistory(s),
      future: [],
      rooms: { ...s.rooms, [id]: { ...s.rooms[id], ...patch } },
    })),

  moveRoom: (id, dx, dy) =>
    set((s) => {
      const room = s.rooms[id];
      if (!room) return s;
      const sd = { ...room.shapeData };
      sd.x = snap(sd.x + dx, s.gridSize, s.snapToGrid);
      sd.y = snap(sd.y + dy, s.gridSize, s.snapToGrid);
      return {
        history: pushHistory(s),
        future: [],
        rooms: { ...s.rooms, [id]: { ...room, shapeData: sd } },
      };
    }),

  resizeRoom: (id, next) =>
    set((s) => {
      const room = s.rooms[id];
      if (!room) return s;
      const sd = { ...room.shapeData };
      if (next.x !== undefined) sd.x = snap(next.x, s.gridSize, s.snapToGrid);
      if (next.y !== undefined) sd.y = snap(next.y, s.gridSize, s.snapToGrid);
      sd.width = Math.max(40, snap(next.width, s.gridSize, s.snapToGrid));
      sd.height = Math.max(40, snap(next.height, s.gridSize, s.snapToGrid));
      return {
        history: pushHistory(s),
        future: [],
        rooms: { ...s.rooms, [id]: { ...room, shapeData: sd } },
      };
    }),

  rotateRoom: (id, rotation) =>
    set((s) => {
      const room = s.rooms[id];
      if (!room) return s;
      const sd = { ...room.shapeData, rotation };
      return {
        history: pushHistory(s),
        future: [],
        rooms: { ...s.rooms, [id]: { ...room, shapeData: sd } },
      };
    }),

  renameRoom: (id, name) =>
    set((s) => {
      const room = s.rooms[id];
      if (!room) return s;
      return {
        history: pushHistory(s),
        future: [],
        rooms: { ...s.rooms, [id]: { ...room, name } },
      };
    }),

  recolorRoom: (id, color) =>
    set((s) => {
      const room = s.rooms[id];
      if (!room) return s;
      return {
        history: pushHistory(s),
        future: [],
        rooms: { ...s.rooms, [id]: { ...room, color } },
      };
    }),

  addRoom: (shape, floorId, at) => {
    const id = `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const sizes = {
      rect: { width: 200, height: 150 },
      l_shape: { width: 240, height: 200 },
      circle: { width: 160, height: 160 },
      polygon: { width: 200, height: 150 },
    } as const;
    const dims = sizes[shape];
    const s = get();
    const newRoom: DesignerRoom = {
      id,
      floorId,
      name: 'New Room',
      slug: '',
      shape,
      shapeData: {
        x: snap(at.x - dims.width / 2, s.gridSize, s.snapToGrid),
        y: snap(at.y - dims.height / 2, s.gridSize, s.snapToGrid),
        width: dims.width,
        height: dims.height,
        rotation: 0,
      },
      color: '#0F766E',
      icon: null,
      isNew: true,
    };
    set((s) => ({
      history: pushHistory(s),
      future: [],
      rooms: { ...s.rooms, [id]: newRoom },
      selectedId: id,
    }));
    return id;
  },

  deleteRoom: (id) =>
    set((s) => {
      const room = s.rooms[id];
      if (!room) return s;
      const next: DesignerRoom = { ...room, isDeleted: true };
      return {
        history: pushHistory(s),
        future: [],
        rooms: { ...s.rooms, [id]: next },
        selectedId: s.selectedId === id ? null : s.selectedId,
      };
    }),

  undo: () =>
    set((s) => {
      const prev = s.history[s.history.length - 1];
      if (!prev) return s;
      const future = [
        { rooms: structuredClone(s.rooms), selectedId: s.selectedId },
        ...s.future,
      ];
      return {
        history: s.history.slice(0, -1),
        future,
        rooms: prev.rooms,
        selectedId: prev.selectedId,
      };
    }),

  redo: () =>
    set((s) => {
      const next = s.future[0];
      if (!next) return s;
      const history = [
        ...s.history,
        { rooms: structuredClone(s.rooms), selectedId: s.selectedId },
      ];
      return {
        history,
        future: s.future.slice(1),
        rooms: next.rooms,
        selectedId: next.selectedId,
      };
    }),

  reset: () => set({ history: [], future: [], selectedId: null }),

  changedRooms: () => {
    // Caller decides — for now we return all rooms; the action handles upsert logic.
    const s = get();
    return Object.values(s.rooms);
  },
}));
