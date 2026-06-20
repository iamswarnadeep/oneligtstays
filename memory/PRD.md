# OneLightStays — PRD (Product Requirements Document)

## Problem statement (original)
Develop OneLightStays — a modern hospitality booking platform inspired by Airbnb and StayVista,
focused on hotels, resorts, villas, homestays, cottages and rooms owned by the company.
No host module; only Admin can manage properties/rooms/bookings.
User chose: React + FastAPI + MongoDB. JWT email/password + email OTP (SMTP demo mode toggle).
OpenStreetMap. Placeholder images. Customer-facing site + basic admin CRUD.

## Tech Stack
- React (CRA + craco) + Tailwind + Radix UI
- FastAPI + Motor (MongoDB)
- JWT (PyJWT), bcrypt password hashing
- SMTP with `SMTP_DEMO_MODE=demo` toggle in `.env`
- OpenStreetMap embed for property location

## User Roles
- **Customer**: browse, search, book, wishlist, reviews, profile, change password
- **Admin**: dashboard + Properties/Rooms/Bookings CRUD

## Implemented (2026-06-20)
- Backend
  - Auth: register w/ OTP, verify, resend, login, logout, me, forgot/reset password, change password, update profile
  - Properties: list w/ filters (destination/type/price/rating/q/featured), detail by slug
  - Rooms: linked to property; admin CRUD
  - Bookings: create (pay at reception), list mine, cancel; admin list & status update
  - Wishlist: toggle, list
  - Reviews: create, computes avg rating
  - Destinations: list, admin create/delete
  - Admin stats: revenue, bookings, occupancy, monthly chart, customers
  - Seed: 1 admin, 6 destinations, 6 properties with multiple rooms
- Frontend
  - HomePage: hero carousel, search widget, destinations grid, special offer, featured props, why-choose, testimonials, newsletter
  - SearchResultsPage: sidebar filters + grid/list cards
  - PropertyDetailsPage: gallery, rooms, amenities, policies, rules, FAQ, OpenStreetMap, reviews + review form, sticky booking widget
  - AuthModal: Login / Register / OTP / Forgot / Reset (single modal, multi-mode)
  - ProfilePage: Profile / Bookings / Wishlist / Password
  - AdminLayout: Dashboard / Properties / Rooms / Bookings with editor modals
- Theme: "Organic & Earthy" — Cormorant Garamond + Manrope, olive #4A5D23 primary, terracotta #C17767 accent, cream background

## Backlog
- P1: Pay-at-reception confirmation email via real SMTP / Booking PDF
- P1: Property availability calendar (block already booked dates)
- P2: Blog module, CMS pages (About/Privacy/Terms), Coupons & offers
- P2: WhatsApp Inquiry floating button
- P2: Lightbox gallery & Swiper for hero
- P2: SEO metadata per route (react-helmet)

## Test credentials
See `/app/memory/test_credentials.md`
