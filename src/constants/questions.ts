export const QUESTION_GROUPS = {
  exterior: ['frame', 'manlid', 'serial', 'cargo_labels'],
  interior: ['odor', 'clean', 'dry', 'pitting', 'discoloration'],
  valves_fittings: [
    'valves',
    'steam_pipeline',
    'syphon_tubes',
    'spillage_drain',
    'bottom_outlet',
    'manlid_gasket',
    'steam_clean',
    'steam_leak',
    'gas_free',
  ],
} as const;

export type SectionKey = keyof typeof QUESTION_GROUPS;

export const SECTION_KEYS = Object.keys(QUESTION_GROUPS) as SectionKey[];

export const ALL_QUESTION_IDS: ReadonlySet<string> = new Set(
  Object.values(QUESTION_GROUPS).flat(),
);

export const PHOTO_POSITIONS = [
  'front',
  'back',
  'left',
  'right',
  'top',
  'bottom',
] as const;

export type PhotoPosition = (typeof PHOTO_POSITIONS)[number];
export type PhotoSide = 'outside' | 'inside';

export const MAX_VIDEOS = 3;
export const MAX_VIDEO_BYTES = 1_000_000;
