# Raider Pal - Comprehensive Code Review Plan

## Executive Summary

This is a **well-architected Next.js application** with professional-grade patterns suitable for showcasing to colleagues. The codebase demonstrates strong architectural discipline, type safety, and thoughtful design decisions. Below is a structured code review covering strengths, improvement areas, and recommended fixes before presenting to coworkers.

---

## Project Overview

**Raider Pal** is a gaming companion tool for managing crafting, recycling, and repair calculations. Built with:
- Next.js 15 (App Router)
- React 19
- TypeScript 5 (strict mode)
- Supabase (PostgreSQL backend)
- Tailwind CSS 4
- Minimal dependencies (5 prod, 8 dev)

**Architecture Pattern:** Server-first with clear data flow:
```
Client Components → Hooks → API Routes → Repositories → Supabase Views
```

---

## Major Strengths to Highlight

### 1. **Architectural Excellence**
- **Clear separation of concerns**: UI layer never touches database directly
- **ESLint enforcement**: Custom rules prevent architectural violations (e.g., blocking direct Supabase imports in client code)
- **API response envelopes**: Standardized `{ success, data/error }` pattern across all endpoints
- **Version-aware caching**: Client cache invalidates automatically when data version changes
- **Repository pattern**: Business logic centralized in `lib/data/*.repo.ts`

### 2. **Type Safety**
- Strict TypeScript mode enabled
- Zero usage of `any` type
- Custom validation library (`lib/validation.ts`) with full type inference
- End-to-end typing from database views to UI components

### 3. **Professional Tooling**
- Comprehensive documentation in `docs/` with Mermaid diagrams
- Development-only cache debug panel for monitoring
- Unit tests for business logic (`repairs.math.test.ts`)
- Path aliases (`@/*`) for clean imports

### 4. **Security Posture**
- Supabase SDK prevents SQL injection
- Input validation on all API routes (Zod-like schemas)
- Environment variable handling with fallbacks
- Development vs production error handling (detailed in dev, masked in prod)

---

## Code Quality Findings

### Component Quality (components/)

**ItemsBrowseClient.tsx** (557 lines) - ⭐ Strong but could be improved:
- ✅ Proper focus management for modals
- ✅ Keyboard navigation (Escape, Tab trapping)
- ✅ Loading states and pagination
- ⚠️ Component is large - could extract modal, search controls, and pagination into sub-components
- ⚠️ Manual dialog implementation - consider native `<dialog>` element for better accessibility

**CacheDebugPanel.tsx** (412 lines) - ✅ Good development tool:
- ✅ Dev-only component for monitoring cache behavior
- ✅ Draggable panel with resize
- ⚠️ Hardcoded dimensions (800px width) should be configurable

### Custom Hooks (hooks/)

**useCachedJson.ts** (130 lines) - ⭐ Excellent design:
- ✅ Clean API with version-based invalidation
- ✅ Schema validation integrated
- ✅ Proper loading/error state management
- ⚠️ Dependency array includes all `opts` - if new instances created on each render, causes unnecessary refetches
- Consider: Memoization of callback to prevent recreation

**useRaidReminders.ts** - ⭐ Creative implementation:
- ✅ Uses `useSyncExternalStore` for global state
- ✅ localStorage hydration on mount
- ⚠️ Global mutable state (unconventional but functional)
- ⚠️ No type safety on localStorage read (line 54 casts without validation)

### API Routes (app/api/)

**All routes** (items/[id]/*, repair-economy/, version/) - ⭐ Excellent consistency:
- ✅ Identical pattern across all routes (validation → fetch → validate → return)
- ✅ Proper Cache-Control headers aligned with ISR
- ✅ Error handling with development re-throw
- ⚠️ No rate limiting (security consideration for public endpoints)
- ⚠️ Missing request logging for monitoring

**Key Files:**
- `app/api/items/[id]/crafting/route.ts`
- `app/api/repair-economy/route.ts`
- `app/api/version/route.ts`

### Data Layer (lib/data/)

**items.repo.ts** (285 lines) - ⭐ Excellent repository pattern:
- ✅ Clear function naming (get*, list*, search*)
- ✅ Metadata enrichment pattern (separate fetch then attach)
- ✅ Deduplication of IDs before batch fetch
- ⚠️ **N+1 Query Pattern** (lines 183-191):
  ```typescript
  // Main query
  const rows = await queryView(VIEW_CONTRACTS.crafting, ...);
  // Follow-up query
  const components = await fetchMetadataByIds(...);
  ```
  - **Recommendation**: Create database view with JOIN instead of separate fetch
  - Current approach works but adds network roundtrip

**query.ts** (117 lines) - ✅ Type-safe query builder:
- ✅ Generic `queryView<T>` with schema validation
- ✅ Detailed error messages with context
- ✅ Custom error classes with HTTP status codes

### Caching Strategy (lib/clientCache.ts)

**clientCache.ts** (374 lines) - ⭐ Sophisticated implementation:
- ✅ TTL-based caching with localStorage
- ✅ Version-based invalidation (cache key includes version)
- ✅ Debug event system for development
- ✅ User preference for long cache durations
- ⚠️ **No cache size limits** - localStorage could fill up without eviction (QuotaExceededError)
- ⚠️ **No URL normalization** - `?q=item%20name` vs `?q=item+name` create separate entries
- ⚠️ **Silent storage failures** (lines 120-122) - should implement LRU cleanup on quota errors

### HTTP Utilities (lib/http.ts)

**http.ts** (172 lines) - ✅ Professional response handling:
- ✅ Standardized `jsonOk()` and `jsonError()` builders
- ✅ Development error re-throwing for debugging
- ✅ Type-safe response envelopes
- ⚠️ `assertResponseShape()` throws generic Error - should use custom error class

---

## Security Review

### ✅ Strong Points
1. **No SQL injection**: Supabase SDK uses parameterized queries
2. **Input validation**: All route parameters validated with schemas
3. **Environment separation**: Dev/prod error handling differs appropriately
4. **View contracts**: Database only exposes specific fields (no `SELECT *`)

### ⚠️ Areas Needing Attention

**1. Search Filter Injection Risk** (items.repo.ts:124-126):
```typescript
if (filters.search) {
  const query = `%${filters.search.trim()}%`;
  next = next.or(`name.ilike.${query},item_type.ilike.${query},...`);
}
```
- **Risk**: String interpolation in PostgREST DSL
- **Fix**: Add character whitelist validation:
  ```typescript
  if (!/^[\w\s\-'.]*$/.test(sanitized)) {
    throw new Error("Invalid search characters");
  }
  ```

**2. Missing Security Headers**:
- No `X-Content-Type-Options: nosniff`
- No `X-Frame-Options: DENY`
- No `Content-Security-Policy`
- **Fix**: Add middleware for security headers

**3. ID Parameter Validation** (crafting/route.ts:12):
```typescript
const itemParamsSchema = z.object({
  id: z.string().trim().min(1, "Missing or invalid id"),
});
```
- **Enhancement**: Add max length and character whitelist:
  ```typescript
  id: z.string().trim().min(1).max(255).regex(/^[a-zA-Z0-9_-]+$/)
  ```

**4. Production Error Information Disclosure**:
- Error messages like "Supabase query failed..." could leak implementation details
- **Fix**: Mask technical errors in production (already partially implemented)

---

## Performance Analysis

### ✅ Good Patterns
1. **Multi-layer caching**:
   - ISR: 86400s (1 day)
   - HTTP: max-age=900, stale-while-revalidate=85500
   - Client: 1 hour TTL
2. **Lazy loading**: Modal data fetched only when item selected
3. **Image optimization**: Next.js Image component with proper sizing

### ⚠️ Optimization Opportunities

**1. N+1 Query Pattern** (items.repo.ts:183-191, 206-207):
- Current: 2 queries (main + metadata enrichment)
- Better: Create database view with JOIN
- Example:
  ```sql
  CREATE VIEW rp_view_crafting_with_metadata AS
  SELECT c.*, m.name, m.rarity, m.icon
  FROM rp_view_crafting_normalized c
  LEFT JOIN rp_view_metadata m ON c.component_id = m.id;
  ```

**2. Cache Misalignment**:
- Repair-economy: ISR 1hr, HTTP 5min, client 30min (inconsistent)
- Item routes: ISR 24hr, HTTP 15min, client 1hr (better aligned)
- **Fix**: Document and align cache durations with constants

**3. No Cache Eviction Policy**:
- localStorage fills indefinitely
- **Fix**: Implement LRU eviction when quota exceeded

**4. Large Component Size**:
- ItemsBrowseClient: 557 lines
- **Fix**: Extract `<PreviewModal>`, `<SearchControls>`, `<PaginationControls>`

---

## Testing Gaps

### Current Coverage
✅ Unit tests: `lib/data/repairs.math.test.ts` (business logic)

### Missing Coverage
- ❌ No API route tests
- ❌ No component tests (React Testing Library)
- ❌ No integration tests
- ❌ No E2E tests

**Recommendation**: Add test suite with priority:
1. API route integration tests (high value)
2. Critical component tests (ItemsBrowseClient, RepairCalculatorClient)
3. Hook tests (useCachedJson)
4. E2E smoke tests (Playwright)

---

## Code Consistency Issues

### Minor Inconsistencies
1. **Magic numbers scattered**:
   - `pageSize = 20` (ItemsBrowseClient:90)
   - `visiblePageCount = 5` (ItemsBrowseClient:91)
   - `VERSION_TTL = 60000` (CacheDebugPanel:128)
   - **Fix**: Centralize in `lib/constants.ts`

2. **Cache key magic string** (clientCache.ts:91):
   ```typescript
   const v = version === undefined ? "nov" : String(version);
   ```
   - "nov" (no version) is cryptic
   - **Fix**: Use constant: `const NO_VERSION_KEY = "no-version"`

3. **Type assertion without validation** (CacheDebugPanel:53):
   ```typescript
   const event = (e as CustomEvent<CacheEvent>).detail;
   ```
   - No runtime check this is actually CustomEvent
   - **Fix**: Add guard: `if (!(e instanceof CustomEvent)) return;`

---

## Documentation Quality

### ✅ Excellent
- Architecture diagrams in `docs/mermaid_diagrams/`
- API contracts documented in `docs/contracts.md`
- Database schema with introspection SQL
- Every file has JSDoc header with purpose

### ⚠️ Could Enhance
- No OpenAPI/Swagger spec for API discovery
- No error code reference documentation
- Component prop types lack descriptions

---

## Accessibility Considerations

### Current State
- ✅ Semantic HTML (role="dialog", aria-modal)
- ✅ Focus management in modals
- ✅ Keyboard navigation (Escape, Tab)
- ⚠️ Custom dialog implementation - could use native `<dialog>` for better support
- ⚠️ No ARIA labels on interactive elements
- ⚠️ No accessibility audit (axe-core)

**Recommendation**: Run axe DevTools audit and address critical issues

---

## Critical Files for Review

### Must Review Before Showing Colleagues
1. [lib/http.ts](lib/http.ts) - Response envelope pattern
2. [lib/clientCache.ts](lib/clientCache.ts) - Caching strategy
3. [lib/data/items.repo.ts](lib/data/items.repo.ts) - Repository pattern with N+1 queries
4. [components/ItemsBrowseClient.tsx](components/ItemsBrowseClient.tsx) - Largest component
5. [app/api/items/[id]/crafting/route.ts](app/api/items/[id]/crafting/route.ts) - API route pattern
6. [hooks/useCachedJson.ts](hooks/useCachedJson.ts) - Custom hook design
7. [lib/validation.ts](lib/validation.ts) - Custom validation library
8. [lib/data/db/query.ts](lib/data/db/query.ts) - Query builder with validation

---

## Recommended Action Items

### 🔴 Critical - Security (Fix Before Showing)
1. **Add input sanitization for search filters** (items.repo.ts:124-126)
   - Risk: PostgREST DSL string interpolation could allow filter manipulation
   - Fix: Validate `filters.search` with regex whitelist: `/^[\w\s\-'.]*$/`
   - Location: `lib/data/items.repo.ts`

2. **Add ID parameter validation** (all API routes)
   - Risk: No max length or character restrictions on ID parameters
   - Fix: Add to schema: `.max(255).regex(/^[a-zA-Z0-9_-]+$/)`
   - Locations: `app/api/items/[id]/*/route.ts`

3. **Implement security headers middleware**
   - Missing: X-Content-Type-Options, X-Frame-Options, CSP
   - Fix: Create `middleware.ts` with security headers
   - Location: Root directory

### 🔴 Critical - Architecture/Quality
4. **Extract large component** (ItemsBrowseClient: 557 lines)
   - Issue: Modal, search, pagination all in one component
   - Fix: Extract `<PreviewModal>`, `<SearchControls>`, `<PaginationControls>`
   - Location: `components/ItemsBrowseClient.tsx`

5. **Add cache eviction policy** (localStorage quota handling)
   - Issue: Silent failure when quota exceeded, no cleanup
   - Fix: Implement LRU eviction on QuotaExceededError
   - Location: `lib/clientCache.ts:118-122`

### 🟡 Important - Security
6. **Mask production error messages**
   - Issue: Technical details leak in error messages
   - Fix: Generic errors in prod, detailed in dev
   - Location: `lib/data/db/query.ts`

7. **Add rate limiting** on public API endpoints
   - Issue: No DoS protection
   - Fix: Implement rate limiting middleware or edge config
   - Location: All `app/api/*/route.ts`

### 🟡 Important - Architecture/Performance
8. **Fix N+1 query pattern** (metadata enrichment)
   - Issue: Separate metadata fetch after main query
   - Fix: Create database views with JOINs
   - Locations: `items.repo.ts:183-191, 206-207`

9. **Align cache duration strategy**
   - Issue: Inconsistent TTLs across layers
   - Fix: Document strategy, align repair-economy cache
   - Location: All API routes, `lib/constants.ts`

10. **Add request/response logging**
    - Issue: No visibility into API usage or errors
    - Fix: Middleware logger with request ID
    - Location: Root `middleware.ts`

### 🟢 Nice-to-Have - Quality/Polish
11. **Add React error boundaries**
12. **Write API route integration tests**
13. **Run accessibility audit** (axe-core)
14. **Centralize magic numbers** to constants
15. **Add OpenAPI/Swagger documentation**

---

## Review Summary Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| Architecture | 9/10 | Excellent separation of concerns, minor N+1 issue |
| Type Safety | 9/10 | Strict mode, zero `any`, custom validation |
| Code Quality | 8/10 | Clean patterns, some large components |
| Security | 7/10 | Good fundamentals, missing headers & sanitization |
| Performance | 7/10 | Good caching, N+1 queries need addressing |
| Testing | 5/10 | Only one test file, needs expansion |
| Documentation | 8/10 | Excellent architecture docs, missing API reference |
| Accessibility | 6/10 | Basic support, needs audit & improvements |

**Overall: 7.5/10 - Production-Ready with Recommended Improvements**

---

## Presentation Strategy for Colleagues

When showing this to coworkers, emphasize:

### Lead with Strengths
1. **Architecture enforcement via ESLint** - prevents mistakes automatically
2. **Data flow diagram** - show how view contracts prevent schema leakage
3. **Version-aware caching** - automatic invalidation on data changes
4. **Type safety discipline** - zero `any` usage, custom validation
5. **Comprehensive documentation** - Mermaid diagrams and contracts

### Acknowledge Areas for Improvement
1. "I know the ItemsBrowseClient is large - I plan to extract the modal"
2. "I'm aware of the N+1 pattern in metadata enrichment - considering a JOIN view"
3. "Test coverage is limited right now - I've prioritized business logic tests first"

### Ask for Specific Feedback
1. "What do you think of the custom validation library vs using Zod?"
2. "How would you approach the cache eviction policy?"
3. "Any suggestions for the API route testing strategy?"

---

## Conclusion

**Raider Pal is well-architected and demonstrates strong engineering fundamentals.** The code is clean, well-documented, and production-ready. The recommended improvements are primarily around:
- Defensive security (input sanitization, headers)
- Performance optimization (N+1 queries, cache eviction)
- Component organization (extract large components)
- Test coverage expansion

This is solid work for a first shipped product, especially from a non-developer background. The architectural patterns and type safety discipline are particularly impressive.
