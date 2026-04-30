/**
 * Strumming Pattern Engine Types and Utilities
 */

export type StrumMotion = "down" | "up" | "rest" | "mute";

export interface StrummingPattern {
  id: string;
  name: string;
  motions: StrumMotion[];
}

export const PRESET_PATTERNS: StrummingPattern[] = [
  {
    id: "alternate",
    name: "Alternate Strum",
    motions: ["down", "up", "down", "up"],
  },
  {
    id: "pop",
    name: "Basic Pop Pattern",
    motions: ["down", "down", "up", "up", "down", "up"],
  },
  {
    id: "ballad",
    name: "Slow Ballad",
    motions: ["down", "rest", "down", "up"],
  },
  {
    id: "groove",
    name: "Muted Groove",
    motions: ["down", "mute", "up", "rest"],
  },
];

export const MOTION_ARROWS: Record<StrumMotion, string> = {
  down: "↓",
  up: "↑",
  rest: "•",
  mute: "×",
};

export const MOTION_SOUNDS: Record<StrumMotion, string> = {
  down: "Down",
  up: "Up",
  rest: "Rest",
  mute: "Mute",
};
