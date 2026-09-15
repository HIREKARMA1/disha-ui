# Archived marketing homepage

These files powered the pre–opportunity-hub Disha landing page (`DishaHomepage` and related section components). They are **not imported** by the live app.

**Active home (since Unstop-style hub):**

- `../OpportunityHub.tsx` — jobs + events discovery on `/`
- `../HomePageClient.tsx` — auth gate (guests/students → hub; uni/corp/admin → dashboard)

**Why kept:** reference design / copy if we need marketing sections again (e.g. a future `/about` or campaign page).

**Do not** wire these back into `app/page.tsx` without product decision — `/` is intentionally an opportunity feed; full browsing stays on `/jobs` and `/events`.

To restore temporarily for comparison:

```tsx
// app/page.tsx (not recommended for production)
import DishaHomepage from '@/components/home/_archive/DishaHomepage'
```
