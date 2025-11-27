/**
 * Gig Mood Presets
 * 
 * A curated set of mood/vibe tags for gigs.
 * The stored value in the DB is the full label string (with emoji).
 * 
 * To add a new mood: just add an entry to GIG_MOOD_PRESETS below.
 * To customize emojis or wording: edit the label strings.
 */

export interface GigMoodPreset {
  id: string;       // Internal identifier (e.g., "laid_back")
  label: string;    // Display label stored in DB (e.g., "Laid back 🍷")
}

/**
 * Curated mood presets
 * Keep this list short and musician-friendly.
 * The label is what gets stored in the database and displayed everywhere.
 */
export const GIG_MOOD_PRESETS: GigMoodPreset[] = [
  { id: "laid_back", label: "Laid back 🍷" },
  { id: "high_energy", label: "High energy 🔥" },
  { id: "background", label: "Background 🎷" },
  { id: "wedding", label: "Wedding 🕊️" },
  { id: "corporate", label: "Corporate ✨" },
  { id: "club", label: "Club night 🌃" },
  { id: "acoustic", label: "Acoustic 🪕" },
  { id: "jazz", label: "Jazz vibes 🎺" },
];

/**
 * Special "custom" option for when presets don't fit
 */
export const CUSTOM_MOOD_ID = "custom";

/**
 * Check if a mood value matches a preset
 * @param mood - The mood string from the database
 * @returns The matching preset, or undefined if it's a custom mood
 */
export function findMoodPreset(mood: string | null | undefined): GigMoodPreset | undefined {
  if (!mood) return undefined;
  return GIG_MOOD_PRESETS.find(preset => preset.label === mood);
}

/**
 * Check if a mood is custom (not in the presets list)
 * @param mood - The mood string from the database
 * @returns true if the mood is custom (not empty and not in presets)
 */
export function isCustomMood(mood: string | null | undefined): boolean {
  if (!mood) return false;
  return !GIG_MOOD_PRESETS.some(preset => preset.label === mood);
}

