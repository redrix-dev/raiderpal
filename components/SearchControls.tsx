/**
 * @fileoverview Search and filter controls for item browsing
 *
 * Provides text search input and rarity filter dropdown for filtering items.
 */

"use client";

/**
 * Rarity filter options
 */
export type RarityFilter = "all" | string;

/**
 * Props for the SearchControls component
 */
type SearchControlsProps = {
  /** Current search query */
  search: string;
  /** Handler for search query changes */
  onSearchChange: (value: string) => void;
  /** Current rarity filter */
  rarity: RarityFilter;
  /** Handler for rarity filter changes */
  onRarityChange: (value: RarityFilter) => void;
  /** Available rarity options */
  rarityOptions: string[];
};

/**
 * Search and filter controls component
 *
 * @param props - Component props
 * @returns React component
 */
export function SearchControls({
  search,
  onSearchChange,
  rarity,
  onRarityChange,
  rarityOptions,
}: SearchControlsProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end">
      <div className="flex-1">
        <label className="block text-xs font-medium text-muted mb-1">
          Search
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Name, type, or loot area"
          className="w-full rounded-md border border-brand-cyan/60 bg-surface-panel px-3 py-2 text-base sm:text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-brand-cyan hover:border-brand-cyan"
        />
      </div>

      <div className="w-full md:w-52">
        <label className="block text-xs font-medium text-muted mb-1">
          Rarity
        </label>
        <select
          value={rarity}
          onChange={(e) => onRarityChange(e.target.value as RarityFilter)}
          className="w-full rounded-md border border-brand-cyan/60 bg-surface-panel px-3 py-2 text-base sm:text-sm text-primary focus:outline-none focus:ring-1 focus:ring-[#4fc1e9] hover:border-[#4fc1e9]"
        >
          <option value="all">All rarities</option>
          {rarityOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
