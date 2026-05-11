# IMPACTFORGE

A hyperlocal, mobile-first web app that connects Donors (giving items), Seekers (requesting items), and Mediators (volunteer couriers) in a community aid ecosystem.

## Core Concept
- **Three personas:** Donor (Arjun), Seeker (Priya), Mediator (Sneha)
- **Identity Shifter:** Toggle between all three roles seamlessly.
- **Geotagged Items:** Proximity filter shows only listings within 2km.
- **Urgency System:** Urgent / 24hrs / Flexible with countdown timers.
- **Mediators:** Bridge the gap between Donor and Seeker via a Quest Map.

## Tech Stack
- **Frontend:** React + Vite (TypeScript), React Router DOM, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **Mapping:** Leaflet.js + React-Leaflet + Leaflet Routing Machine
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **QR Code:** qrcode.react + react-qr-reader
- **Timers:** date-fns + setInterval
- **Testing:** Cypress / Playwright
- **Deployment:** Vercel (GitHub CI/CD)

## Features Built
- Secure Authentication with Supabase
- Geolocation API with 2km proximity filter
- Listings feed, add listings with photo uploads (Supabase Storage)
- Request flow and preset messages
- Identity switcher to toggle roles (Donor/Seeker/Mediator)
- Real-time notifications and chat
- Quest Map with Leaflet.js and live route updates
- QR verification for pickup and delivery
- Profile tabs tracking user statistics

## Getting Started

1. Clone the repository
2. Run `npm install`
3. Setup `.env` file with Supabase credentials
4. Run `npm run dev` to start the local server

## License
MIT
