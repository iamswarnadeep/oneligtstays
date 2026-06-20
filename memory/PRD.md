# OneLightStays — PRD

## Original Problem
Build OneLightStays — a premium hotel / resort / villa / cottage / homestay booking platform inspired by Airbnb and StayVista. NO host module — all properties managed by Admin. Tech stack chosen by user: React + FastAPI + MongoDB. Customer site + basic Admin (Properties / Rooms / Bookings). JWT email/password auth with email OTP. SMTP with demo mode toggle. OpenStreetMap. Placeholder images.

## Architecture
- **Backend**: FastAPI (`/app/backend/server.py`), MongoDB (motor), bcrypt + PyJWT, SMTP via smtplib (with demo mode fallback that returns `demo_otp` in API response when `SMTP_DEMO_MODE=demo`).
- **Frontend**: React 19 + React Router + Tailwind + lucide-react, Axios with Bearer-token interceptor (`localStorage.ols_token`).
- **Database**: Collections — users, otps (TTL-indexed), properties, rooms, bookings, reviews, destinations.

## User Personas
- **Customer** — browses, books, reviews, manages bookings & wishlist.
- **Administrator** — manages properties, rooms, bookings via `/admin`.

## Core Features Implemented
- **Auth**: JWT (Bearer) with email/password + 6-digit OTP (signup & forgot-password); password change.
- **Properties**: list/filter/detail; admin CRUD.
- **Rooms**: per-property room categories with images, capacity, pricing; admin CRUD.
- **Bookings**: dates, guests, computed subtotal+12% tax, OLS booking_number, pay-at-reception, cancellation by owner or admin.
- **Reviews**: rating + text; auto-updates property avg_rating & count.
- **Wishlist**: toggle saved properties.
- **Admin Dashboard**: total revenue, bookings, customers, properties, occupancy, monthly revenue bar chart.

## Frontend Pages (revamped to StayVista aesthetic)
- **Home** — Hero carousel with "Sunday Getaway Sale" + pill search; Pick-a-Destination icon grid; Bank/OLS Offers; Best Rated Villas (tabbed filter); The OneLightStays Standard (bento grid); Choose a Collection; Trust Partners; Stay Like Stars; Stats; List-your-property CTA; Footer with mega-link list.
- **Search** — sticky compact search pill, sidebar filters (Map button, Display Total Price toggle, Price Range, Rooms counter, Key Amenities, Property Type, Amenities, Rating); horizontal list cards with "Best Rated" badge and right-side price + View button; sort dropdown.
- **Property Details** — bento-grid gallery with "+N More" overlay; sticky section tab nav (Overview / Highlights / Refund Policy / Spaces / Reviews / Amenities / Location / Experiences / FAQs); right-side sticky booking widget with check-in/out, guests, rooms, taxes breakdown, Reserve button; OLS Experience strips, refund policy chips, room cards, guest reviews block, OpenStreetMap iframe, reviews list, review-form, FAQs accordion.
- **Auth Modal** — two-column with image panel ("Book a Stay. Live a Story." / "Rooms Starting at ₹5,000*"), floating-label inputs, black pill "Continue" button. Modes: Login / Signup (with phone) / OTP / Forgot / Reset.
- **Profile** — pill tabs (Profile / Trips / Wishlist) centered; floating-label form with First/Last/Gender/DOB/Email/City/Phone (+91); booking cards with cancel; wishlist grid.
- **Admin** — `/admin` Layout with dashboard, properties CRUD with modal editor, rooms CRUD, bookings table with inline status/payment selects.

## Implementation Log
- **2026-06-20** — MVP built: backend (all routes), seeded admin + 6 destinations + 6 properties + 10 rooms; full customer site + admin panel. Backend testing agent run: 22/22 tests pass.
- **2026-06-20** — Frontend revamped to match StayVista designs (black brand, pill search, section tab nav, list cards, two-pane auth modal, pill profile tabs, mega footer).

## Backlog (P1)
- Booking availability/overlap check (prevent overbooking against `total_rooms`).
- Restrict reviews to users with confirmed bookings.
- Replace native `<input type="date">` with shadcn Calendar popover.
- Shadcn-styled image lightbox carousel for the +N More gallery.
- Sticky "Get in touch" floating button on mobile.

## Backlog (P2)
- Blogs, Destination CMS, SEO tags, Sitemap.
- Offers / Coupons engine (current is static UI).
- Payment integration (Stripe / Razorpay).
- Email transactional templates (real SMTP currently logs only in demo mode).

## Test Credentials
- Admin: `admin@onelightstays.com` / `Admin@12345`
- Customer: register via UI — OTP is returned in API response under `demo_otp` (and shown in modal as "Demo OTP: 123456") while `SMTP_DEMO_MODE=demo`.
