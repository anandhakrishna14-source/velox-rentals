# VELOX DRIVE — Luxury Car Rental Booking Platform

> **DRIVE SOMETHING WORTH REMEMBERING.**
> A production-grade, cinematic dark luxury car-rental booking machine engineered for high-performance automotive marques, executive grand tourers, and chauffeured VIP mobility.

---

## 1. Visual & Architectural Highlights

- **Homepage Booking Machine**:
  - Compact Booking Bar placed immediately below the hero for instant reservation without forcing scroll delays.
  - Pickup Location (Bangalore Airport, Mumbai BKC, Delhi Aerocity, Goa Dabolim, Hyderabad), Drop-off, Date range, Driver mode, and instant `[ FIND CARS ]`.
  - Real-time availability calculation (e.g. *“3 cars available for your dates”*), dynamically partitioning the collection into **AVAILABLE NOW** vs. **RESERVED FOR SELECTED DATES**.
- **AI Concierge & Drive Matchmaker** (`/api/ai/recommend`, `/api/ai/concierge-chat`):
  - Powered by `@google/genai` on the server using `gemini-3.8-flash`.
  - *"What are you driving for?"* (Weekend Escape, Business Milestone, Romantic Evening, Royal Wedding, Coastal Road Trip, Track Performance).
  - Generates tailored automotive pairings, recommended scenic driving corridors, and preconfigured protection bundles.
- **Client Suggestions & Feedback Section** (`/api/ai/feedback-analyze`):
  - Verified customer reviews with `Verified Rental ✓` status badges (e.g. Rahul K. ★★★★★ 3-day rental).
  - Public submission portal for patrons to submit drive ratings and suggest future fleet acquisitions (e.g. Porsche 911 GT3 RS, Rolls-Royce Ghost, Bentley Continental GT, BMW M5, Mini JCW).
  - AI sentiment analysis and instantaneous personalized executive concierge responses.
- **Side-by-Side "Compare Cars"**:
  - Compare up to 3 vehicles across 9 technical parameters (Seats, Transmission, Fuel, Horsepower, 0–100 km/h, Top Speed, Drivetrain, Security Deposit, Ideal Occasion).
  - Instant one-click `[ BOOK ]` buttons directly from the comparison matrix.
- **Interactive 3D Viewer with Clickable Hotspots**:
  - Hotspots on the vehicle:
    - **ENGINE**: 350–550 HP Twin-Turbo Powerplant
    - **BRAKES**: 410mm Carbon-Ceramic Slotted Discs & Gold 6-Piston Calipers
    - **LED HEADLIGHTS**: 4-Point Matrix Optics with 600m laser throw
    - **INTERIOR**: 18-Way Adaptive Carbon Sport Bucket Seats & Alcantara cockpit
    - **AERODYNAMICS**: Ducktail downforce wing & ground-effect diffusers
  - Focuses camera smoothly and reveals detailed performance specifications.
- **"Build Your Rental" Configurator & Crystal Clear Deposit Separation**:
  - Transparent itemized ledger:
    - `PAYABLE TODAY: ₹30,997`
    - `+ ₹10,000 Refundable Security Deposit`
    - `TOTAL AUTHORIZATION: ₹40,997`
    - Explanatory terms notice: *"Security deposit refunded after vehicle inspection, subject to rental terms."*
  - Highlighted champagne gold progress indicator (`01 SCHEDULE ─── 02 LOCATION ─── 03 DRIVER ─── 04 PROTECTION ─── 05 VERIFY ─── 06 SETTLEMENT`).
- **Digital Rental Pass (Airline Boarding Pass Style)**:
  - High-definition boarding pass with booking reference `#VX7284`, QR code, curbside terminal notes, and direct driver/concierge communication channels (`[ CALL ]`, `[ CHAT ]`).
- **Digital Vehicle Condition Log**:
  - Pre-pickup and post-return 360° panel checks (Front, Rear, Left, Right, Interior), fuel gauge percentage, odometer tracking, and photo attachment verification.
- **Trust Center**:
  - *"DRIVE WITH CONFIDENCE"*: verified fleet audits, tokenized PCI-DSS payments, verified chauffeurs, transparent deposits, and 24/7 roadside assistance.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion
- **3D Graphics & WebGL**: Three.js (PBR physically based materials: MeshPhysicalMaterial with clearcoat, roughness, metalness, studio 3-point illumination)
- **AI Intelligence**: `@google/genai` TypeScript SDK (server-side proxy routes with `gemini-3.8-flash`)
- **Backend**: Node.js & Express (`server.ts` with Vite middleware)
- **Icons**: Lucide React

---

## 3. Getting Started

### Installation
```bash
# Install dependencies
npm install

# Start the full-stack server
npm run dev
```

Visit `http://localhost:3000` to interact with the platform.

### Building for Production
```bash
npm run build
npm start
```
