## Cache Strategy

### ISR (Incremental Static Regeneration)
- Item detail pages: `revalidate = 86400` (24 hours)
- Browse pages: `force-dynamic` (always fresh for search/filter)
- Tool pages: `force-dynamic` (interactive calculators)

### API Route Caching
```typescript
// Fast-changing data (version checks, repair economy)
"Cache-Control": "public, max-age=300, stale-while-revalidate=3300"

// Stable data (item details, crafting, recycling)
"Cache-Control": "public, max-age=900, stale-while-revalidate=85500"
```

### Client-Side Cache
- Uses `localStorage` with version-aware keys
- Default TTL: 1 hour (configurable to 30 days)
- Auto-invalidates when `dataVersion` changes
