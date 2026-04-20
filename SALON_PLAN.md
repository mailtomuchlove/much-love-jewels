# Salon Page — Implementation Plan

## Overview
Add a `/salon` section to the existing Much Love Jewels Next.js app — no new domain or hosting needed.
Static pages with WhatsApp-based appointment booking. Jewellery store stays at `/` as-is.

---

## What's Needed From You Before Starting
- [ ] Services list (e.g. haircut, bridal makeup, facial, etc.)
- [ ] Price list per service (or "price on enquiry" for all)
- [ ] Salon photos for gallery (add to `public/salon/`)
- [ ] Salon address + Google Maps link
- [ ] Opening hours (days + times)

**Already confirmed:**
- WhatsApp number: same as `NEXT_PUBLIC_WHATSAPP_NUMBER`
- Instagram: `@muchlove.salon` (already in `NEXT_PUBLIC_INSTAGRAM_HANDLE`)
- Jewellery Instagram: not configured yet (add `NEXT_PUBLIC_JEWELLERY_INSTAGRAM_HANDLE` later)

---

## Folder Structure Changes

### 1. Rename `(storefront)` → `(jewels)`
```
app/
  (jewels)/           ← renamed from (storefront)
    layout.tsx
    page.tsx
    products/
    collections/
    ...

  (salon)/            ← NEW
    layout.tsx
    page.tsx
    book/page.tsx
```

### 2. Update all imports that reference `(storefront)` path
Most imports use `@/` aliases so renaming the folder is mostly mechanical —
check `app/(storefront)/` references in actions, tests, and any hardcoded paths.

---

## Salon Route Structure

| Route | Page |
|-------|------|
| `/salon` | Landing page (hero, services, gallery, CTA) |
| `/salon/book` | Booking page (WhatsApp CTA + service selector) |

---

## Salon Layout (`app/(salon)/layout.tsx`)
- **No** cart, wishlist, CartDrawer, AuthModal
- Simpler header: Logo + "Back to Jewellery" link + WhatsApp button
- Same Footer as jewellery (or a simplified version)
- Same brand fonts (Playfair + DM Sans) and color tokens

---

## Salon Landing Page Sections (`/salon`)

1. **Hero**
   - Full-width image, salon name, tagline
   - Two CTAs: "Book via WhatsApp" + "View Services"

2. **Services Grid**
   - Static data array in the page file (no DB needed)
   - Cards: service name, short description, price (or "Enquire")
   - Categories: Hair / Skin / Bridal / Other

3. **Gallery**
   - Photo grid (images from `public/salon/`)
   - Same style as Instagram grid — 3-col on desktop, 2-col mobile

4. **About the Salon**
   - Short paragraph about Much Love salon
   - Same warm brand tone as jewellery about page

5. **WhatsApp Booking CTA**
   - Prominent section with pre-filled message:
     `"Hi! I'd like to book a salon appointment at Much Love."`
   - Same green WhatsApp button style as jewellery site

6. **Location & Hours**
   - Address, opening hours table
   - Embedded Google Map (iframe)

---

## Homepage Entry Point (`app/(jewels)/page.tsx`)
Add a "Two Worlds" split card section above the footer:

```
┌──────────────────────┬──────────────────────┐
│  💍 Much Love Jewels │  ✂️  Much Love Salon  │
│  AD & bridal jewels  │  Hair, skin & bridal  │
│  [Shop Collection →] │  [Explore Salon →]    │
└──────────────────────┴──────────────────────┘
```

---

## Instagram Section Update
When jewellery Instagram is ready:
- Add `NEXT_PUBLIC_JEWELLERY_INSTAGRAM_HANDLE` env var
- Salon page shows `@muchlove.salon` feed (existing Behold feed)
- Jewellery homepage shows jewellery Instagram feed

---

## Implementation Order
1. Rename `(storefront)` → `(jewels)` + fix all references
2. Create `app/(salon)/layout.tsx`
3. Create `app/(salon)/page.tsx` with static service/gallery data
4. Create `app/(salon)/book/page.tsx`
5. Add homepage split card section
6. Add salon metadata + sitemap entries for `/salon`

---

## No DB Changes Needed
Everything is static — services, gallery, pricing are hardcoded in page files.
WhatsApp handles all bookings. No payment, no cart, no auth required for salon.
