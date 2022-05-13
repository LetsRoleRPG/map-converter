export interface Grid {
    enabled: boolean;
    size: number;
    type?: GridType;
    offset?: Position;
    color?: string; // Hex color
    opacity?: number;
}

export enum GridType {
    Square = 'square',
    Hex = 'hex'
}

export enum MediaType {
    Image = 'image',
    Video = 'video'
}

export interface Position {
    x: number;
    y: number;
}

export interface Media extends Position {
    type: MediaType;
    data: string; // Base-64 Encoded media
    filename?: string;
}

export interface Lighting {
    enabled: boolean;
    walls?: Wall[];
    lights?: Light[];
    doors?: Door[];
}

export interface Wall {
    id?: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface Light {
    id?: string;
    x: number;
    y: number;
    range?: number;
    intensity?: number;
    color?: string;
}

export interface Door {
    id?: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    closed: boolean;
    gm: boolean;
    knob?: Position;
}