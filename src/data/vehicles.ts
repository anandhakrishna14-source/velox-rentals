import { Vehicle, LocationOption, PricingSettings, FeedbackItem, Booking } from '../types';

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'porsche-911-gt3',
    slug: 'porsche-911-gt3',
    name: 'Porsche 911 GT3 (992)',
    tagline: '4.0L Naturally Aspirated 502HP Motorsport Thoroughbred',
    category: 'Sports',
    seats: 2,
    transmission: 'Dual-Clutch PDK',
    fuel: 'Petrol',
    horsepower: 502,
    acceleration0To100: 3.4,
    topSpeed: 318,
    drivetrain: 'Rear-Wheel Drive',
    dailyPrice: 16999,
    weekendPrice: 19499,
    securityDeposit: 20000,
    available: true,
    featured: true,
    colors: [
      { name: 'Jet Black Metallic', hex: '#0E0F12' },
      { name: 'Racing Yellow Calipers', hex: '#EAB308' },
      { name: 'GT Silver Metallic', hex: '#71767F' },
      { name: 'Guards Red', hex: '#A81A1A' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-super-car-driving-through-the-city-41270-large.mp4',
    features: [
      '4.0L Naturally Aspirated Boxer-6 Engine (9,000 RPM Redline)',
      '7-Speed Porsche Doppelkupplung (PDK) Transmission',
      'Swan-Neck High-Mount Carbon Aerodynamic Wing',
      'Double-Wishbone Front Axle derived from 911 RSR',
      'Carbon Ceramic Composite Brakes (PCCB) with Yellow Calipers',
      'Full Carbon Bucket Seats with Contrast Racing Stitching',
      'Center-Lock Forged Lightweight Magnesium Alloy Wheels',
      'Integrated Sport Chrono Dial & Track Precision Telemetry'
    ],
    requirements: [
      'Minimum driver age: 24 years',
      'Valid driving license held for at least 3 years',
      'Original Government ID (Passport / Aadhaar) at handover',
      'Refundable security deposit pre-authorized on card'
    ],
    description:
      'The definitive benchmark of pure motorsport engineering. The 992-generation Porsche 911 GT3 features a howling 4.0-liter naturally aspirated flat-six producing 502 horsepower, breathing through a titanium exhaust. Equipped with a Formula-derived swan-neck rear wing and double-wishbone front suspension, it delivers instantaneous turn-in response and spine-tingling acoustic theatre.',
    rating: 4.99,
    reviewsCount: 46,
    reviews: [
      {
        id: 'rev-gt3-1',
        author: 'Rahul K.',
        location: 'Bangalore',
        rating: 5,
        date: 'October 2026',
        comment: 'The 992 GT3 in Jet Black is hypnotic. Revving to 9,000 RPM on the highway is a life experience. Handover was seamless at Bangalore Airport VIP lane.',
        verifiedBooking: true
      },
      {
        id: 'rev-gt3-2',
        author: 'Farhan A.',
        location: 'Mumbai',
        rating: 5,
        date: 'September 2026',
        comment: 'Condition was 100% factory fresh. The 360 studio turntable let me inspect every carbon aero vane before booking.',
        verifiedBooking: true
      }
    ]
  },
  {
    id: 'rolls-royce-ghost',
    slug: 'rolls-royce-ghost',
    name: 'Rolls-Royce Ghost Extended',
    tagline: '6.75L Twin-Turbo V12 Sovereign VIP Chauffeur Saloon',
    category: 'Luxury',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Twin-Turbo V8',
    horsepower: 563,
    acceleration0To100: 4.8,
    topSpeed: 250,
    drivetrain: 'All-Wheel Drive',
    dailyPrice: 24999,
    weekendPrice: 28999,
    securityDeposit: 30000,
    available: true,
    featured: true,
    colors: [
      { name: 'Emerald British Green', hex: '#143826' },
      { name: 'Diamond Black', hex: '#0B0B0D' },
      { name: 'Silver Sand', hex: '#C2B69D' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1631295868223-63265840d001?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-super-car-driving-through-the-city-41270-large.mp4',
    features: [
      '6.75L Twin-Turbocharged V12 Powerplant (850 Nm Torque)',
      'Illuminated Pantheon Grille & Spirit of Ecstasy Mascot',
      'Shooting Star Fiber-Optic Starlight Headliner',
      'Power-Closing Coach (Suicide) Doors with Umbrella Compartments',
      'Planar Suspension System with Flagbearer Road-Reading Cameras',
      'Rear Executive Serenity Lounge with Champagne Refrigerator',
      'Whisper-Quiet Acoustic Damping with 130kg Insulation',
      'Dedicated Professional White-Glove Chauffeur Included'
    ],
    requirements: [
      'Available with verified Velox VIP Chauffeur or vetted self-drive',
      'Original Government ID / Passport at handover',
      'Security deposit authorization'
    ],
    description:
      'The supreme standard of automotive nobility. Finished in regal Emerald British Racing Green with an illuminated Pantheon grille, the Rolls-Royce Ghost Extended glides over uneven tarmac like a magic carpet. Its whisper-quiet cabin is swathed in hand-matched hides, open-pore woods, and a bespoke starlight ceiling.',
    rating: 5.0,
    reviewsCount: 39,
    reviews: [
      {
        id: 'rev-rr-1',
        author: 'Dr. Siddharth Mallya',
        location: 'Mumbai',
        rating: 5,
        date: 'October 2026',
        comment: 'Chauffeur Arjun was waiting 20 minutes prior to our flight arrival at BOM T2. The rear lounge with cooled champagne set the mood for our corporate summit.',
        verifiedBooking: true
      }
    ]
  },
  {
    id: 'bentley-continental-gt',
    slug: 'bentley-continental-gt',
    name: 'Bentley Continental GT Speed',
    tagline: '6.0L W12 Twin-Turbo Supreme British Grand Tourer',
    category: 'Luxury',
    seats: 4,
    transmission: 'Dual-Clutch PDK',
    fuel: 'Twin-Turbo V8',
    horsepower: 650,
    acceleration0To100: 3.6,
    topSpeed: 335,
    drivetrain: 'All-Wheel Drive',
    dailyPrice: 18999,
    weekendPrice: 21999,
    securityDeposit: 25000,
    available: true,
    featured: true,
    colors: [
      { name: 'British Racing Green', hex: '#183A28' },
      { name: 'Beluga Onyx', hex: '#111214' },
      { name: 'Monaco Gold', hex: '#C9A45C' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-super-car-driving-through-the-city-41270-large.mp4',
    features: [
      '6.0L Twin-Turbocharged W12 Engine producing 900 Nm Torque',
      'Rotating Three-Sided Dashboard (Analog, Touchscreen, Wood Veneer)',
      'Diamond-in-Diamond Mulliner Quilted Leather Hide Cockpit',
      'Quad Matrix Crystal LED Headlamps with Cut-Glass Effect',
      'Active All-Wheel Drive with Electronic Limited-Slip Differential',
      '48-Volt Active Anti-Roll Dynamic Ride Suspension',
      '2,200-Watt 18-Speaker Naim for Bentley High-Fidelity Audio',
      'Dual Oval High-Flow Performance Exhaust Tips'
    ],
    requirements: [
      'Minimum driver age: 23 years',
      'Valid driving license or chauffeur privilege',
      'Original photo identification at handover',
      'Security deposit authorization'
    ],
    description:
      'The definitive pinnacle of British grand touring. The Bentley Continental GT Speed pairs brute 650-horsepower W12 muscle with bespoke artisan luxury. In British Racing Green with muscular rear haunches and cut-crystal optics, it dispatches transcontinental distances with surreal poise and spine-tingling torque.',
    rating: 4.97,
    reviewsCount: 31,
    reviews: [
      {
        id: 'rev-bentley-1',
        author: 'Karan Bilimoria',
        location: 'Bangalore',
        rating: 5,
        date: 'October 2026',
        comment: 'The rotating dashboard and W12 roar along the Mysore expressway made our anniversary weekend unforgettable.',
        verifiedBooking: true
      }
    ]
  },
  {
    id: 'bmw-m5-competition',
    slug: 'bmw-m5-competition',
    name: 'BMW M5 Competition (F90)',
    tagline: '4.4L TwinPower Turbo 617HP Super Saloon with M xDrive',
    category: 'Performance',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Twin-Turbo V8',
    horsepower: 617,
    acceleration0To100: 3.3,
    topSpeed: 305,
    drivetrain: 'All-Wheel Drive',
    dailyPrice: 12999,
    weekendPrice: 14999,
    securityDeposit: 15000,
    available: true,
    featured: true,
    colors: [
      { name: 'Black Sapphire Metallic', hex: '#101114' },
      { name: 'Frozen Marina Bay Blue', hex: '#153258' },
      { name: 'Donington Grey', hex: '#5E6168' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-super-car-driving-through-the-city-41270-large.mp4',
    features: [
      '4.4L M TwinPower Turbo V8 delivering 750 Nm Torque',
      '8-Speed M Steptronic Transmission with Drivelogic',
      'M xDrive All-Wheel Drive with 2WD Rear-Wheel Drift Mode',
      'Carbon-Fiber Reinforced Plastic (CFRP) Lightweight Roof',
      'M Sport Quad Exhaust System with Black Chrome Tips',
      'M Multifunction Carbon Sport Seats with Illuminated M5 Badges',
      'Adaptive M Suspension with Electronically Controlled Dampers',
      'Bowers & Wilkins Diamond 16-Speaker Surround Sound'
    ],
    requirements: [
      'Minimum driver age: 23 years',
      'Valid driving license held for at least 2 years',
      'Security deposit pre-authorized on credit card'
    ],
    description:
      'A wolf in bespoke executive tailoring. The BMW M5 Competition (F90) in Black Sapphire combines business-class luxury for five with staggering supercar acceleration (0–100 km/h in 3.3s). Switch from all-wheel drive stability to pure rear-wheel drive via the M Mode cockpit controls.',
    rating: 4.96,
    reviewsCount: 35,
    reviews: [
      {
        id: 'rev-m5-1',
        author: 'Sameer Singhania',
        location: 'Mumbai',
        rating: 5,
        date: 'September 2026',
        comment: 'Dual personality at its absolute best. Relaxing executive saloon in Comfort, and a ferocious rocket in Sport Plus with the quad exhaust singing.',
        verifiedBooking: true
      }
    ]
  },
  {
    id: 'toyota-fortuner-legender',
    slug: 'toyota-fortuner-legender',
    name: 'Toyota Fortuner Legender 4x4',
    tagline: '2.8L High-Torque Turbo-Diesel Rugged Luxury 7-Seater',
    category: 'Luxury SUV',
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Petrol',
    horsepower: 204,
    acceleration0To100: 9.6,
    topSpeed: 190,
    drivetrain: 'Four-Wheel Drive',
    dailyPrice: 6999,
    weekendPrice: 7999,
    securityDeposit: 8000,
    available: true,
    featured: false,
    colors: [
      { name: 'Attitude Black Mica', hex: '#131416' },
      { name: 'Super White Dual-Tone', hex: '#EEEEEE' },
      { name: 'Platinum Pearl', hex: '#D8D8DC' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-super-car-driving-through-the-city-41270-large.mp4',
    features: [
      '2.8L 1GD-FTV High-Torque Turbo-Diesel (500 Nm Torque)',
      'Aggressive Legender Split-Mesh Grille & Aerodynamic Bumper',
      'Quad-LED Headlamps with Waterfall Sequential Turn Signals',
      'Selectable 4x4 with High/Low Range, Rear Diff Lock & DAC',
      'Three-Row 7-Passenger Cabin with Dual-Tone Perforated Leather',
      'JBL Premium 11-Speaker Sound System with Subwoofer',
      'Kick-Sensor Hands-Free Power Tailgate',
      'Wireless Smartphone Charger & 360-Degree Panoramic View Camera'
    ],
    requirements: [
      'Minimum driver age: 21 years',
      'Valid driving license',
      'Self-drive or chauffeur options available',
      'Government identification at handover'
    ],
    description:
      'Commanding road presence meets unshakeable reliability. The Toyota Fortuner Legender 4x4 in Attitude Black is the preeminent choice for executive travel, VIP security convoys, and rugged weekend expeditions to hill stations. With 500 Nm of pulling power, genuine 4x4 low range, and seating for seven.',
    rating: 4.88,
    reviewsCount: 42,
    reviews: [
      {
        id: 'rev-fortuner-1',
        author: 'Amitabh Jha',
        location: 'Delhi NCR',
        rating: 5,
        date: 'October 2026',
        comment: 'Booked the Fortuner Legender for a 4-day trip to Shimla with family. Unmatched ground clearance, supreme air conditioning, and delivered sparkling clean.',
        verifiedBooking: true
      }
    ]
  },
  {
    id: 'mercedes-amg-a35',
    slug: 'mercedes-amg-a35',
    name: 'Mercedes-AMG A 35 4MATIC+',
    tagline: '2.0L Turbocharged 302HP AMG Performance Sportback',
    category: 'Performance',
    seats: 5,
    transmission: 'Dual-Clutch PDK',
    fuel: 'Petrol',
    horsepower: 302,
    acceleration0To100: 4.7,
    topSpeed: 250,
    drivetrain: 'All-Wheel Drive',
    dailyPrice: 7999,
    weekendPrice: 9499,
    securityDeposit: 10000,
    available: true,
    featured: false,
    colors: [
      { name: 'Polar White', hex: '#F0F0F0' },
      { name: 'Cosmos Black Metallic', hex: '#111214' },
      { name: 'Mountain Grey', hex: '#55585E' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-super-car-driving-through-the-city-41270-large.mp4',
    features: [
      'Handcrafted AMG 2.0L 4-Cylinder Turbo Engine (400 Nm Torque)',
      'AMG SPEEDSHIFT DCT 7-Speed Dual-Clutch Transmission',
      'AMG Performance 4MATIC Variable All-Wheel Drive',
      'Signature AMG Twin-Blade Radiator Grille & Aero Flics',
      'Dual 10.25-Inch MBUX Digital Cockpit with AMG Telemetry',
      'AMG Dynamic Select with Slippery, Comfort, Sport, Sport+ & Individual',
      'High-Performance Braking System with Ventilated Discs & Red Calipers',
      'Burmester® Premium Surround Sound System'
    ],
    requirements: [
      'Minimum driver age: 21 years',
      'Valid driving license held for at least 2 years',
      'Security deposit authorization'
    ],
    description:
      'High-octane agility in a sleek modern profile. The Mercedes-AMG A 35 4MATIC+ in Polar White blends razor-sharp handling with executive prestige. Launching from 0 to 100 km/h in 4.7 seconds with active variable 4MATIC all-wheel drive, it carves through city boulevards and mountain curves with equal mastery.',
    rating: 4.92,
    reviewsCount: 37,
    reviews: [
      {
        id: 'rev-a35-1',
        author: 'Natasha Kapoor',
        location: 'Mumbai',
        rating: 5,
        date: 'September 2026',
        comment: 'Incredible punch in such an agile car. The MBUX dual screens and crackle on downshifts are addictive. 10/10 service from Velox.',
        verifiedBooking: true
      }
    ]
  },
  {
    id: 'mini-cooper-s',
    slug: 'mini-cooper-s',
    name: 'MINI Cooper S (3-Door)',
    tagline: '2.0L TwinPower Turbo Iconic Agile Urban Go-Kart',
    category: 'Comfort',
    seats: 4,
    transmission: 'Automatic',
    fuel: 'Petrol',
    horsepower: 189,
    acceleration0To100: 6.7,
    topSpeed: 235,
    drivetrain: 'Front-Wheel Drive',
    dailyPrice: 4999,
    weekendPrice: 5999,
    securityDeposit: 6000,
    available: false, // Simulated unavailable for date tests
    featured: false,
    colors: [
      { name: 'Electric Island Blue', hex: '#73A9D4' },
      { name: 'Midnight Black Roof', hex: '#111214' },
      { name: 'Chili Red', hex: '#A81C1C' },
      { name: 'British Racing Green IV', hex: '#193A27' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1570733117311-d990c3816c47?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-super-car-driving-through-the-city-41270-large.mp4',
    features: [
      '2.0L 4-Cylinder MINI TwinPower Turbocharged Powerplant (280 Nm Torque)',
      '7-Speed Steptronic Sport Dual-Clutch Transmission with Paddle Shifters',
      'Iconic Circular Full LED Headlamps with Halo Daytime Running Lights',
      'Distinctive Union Jack Signature LED Taillights',
      'Central Twin Chrome Sport Exhaust Pipes with Overrun Pops',
      'MINI Driving Modes: SPORT (Go-Kart Feel), MID, and GREEN',
      '8.8-Inch Touchscreen with Interactive LED Ambient Light Ring',
      'John Cooper Works Leather Sport Steering Wheel'
    ],
    requirements: [
      'Minimum driver age: 21 years',
      'Valid driving license',
      'Security deposit pre-authorization'
    ],
    description:
      'The quintessential icon of urban style and go-kart handling. The MINI Cooper S 3-Door in Electric Island Blue with contrasting black roof turns heads at every corner. Nimble, turbocharged, and bursting with personality, it features central dual exhaust pipes, circular halo LEDs, and British Union Jack taillights.',
    rating: 4.89,
    reviewsCount: 48,
    reviews: [
      {
        id: 'rev-mini-1',
        author: 'Ayesha Merchant',
        location: 'Goa',
        rating: 5,
        date: 'October 2026',
        comment: 'The perfect car for exploring the coastal roads of North Goa! Compact enough to park anywhere, but fast and stylish. The Union Jack taillights look stunning at night.',
        verifiedBooking: true
      }
    ]
  }
];

export const INITIAL_LOCATIONS: LocationOption[] = [
  {
    id: 'loc-blr-airport',
    name: 'Bangalore Int. Airport (BLR T2 VIP Curbside)',
    type: 'AIRPORT',
    address: 'Terminal 2 VIP Arrival Lane, Devanahalli, Bangalore 560300',
    operatingHours: '24 Hours / 7 Days',
    deliveryFee: 0
  },
  {
    id: 'loc-blr-whitefield',
    name: 'Bangalore Signature Hub — Whitefield / Indiranagar',
    type: 'SHOWROOM',
    address: 'Velox Private Pavilion, Prestige Tech Cloud, Bangalore',
    operatingHours: '08:00 AM – 11:00 PM',
    deliveryFee: 0
  },
  {
    id: 'loc-bom-airport',
    name: 'Mumbai Int. Airport (BOM T2 VIP Lane)',
    type: 'AIRPORT',
    address: 'Terminal 2 Curbside VIP Departure/Arrival, Sahar, Andheri East, Mumbai',
    operatingHours: '24 Hours / 7 Days',
    deliveryFee: 0
  },
  {
    id: 'loc-bom-bkc',
    name: 'Mumbai BKC Signature Showroom',
    type: 'SHOWROOM',
    address: 'Grand Pavilion Towers, Ground Floor, G-Block, BKC, Mumbai',
    operatingHours: '08:00 AM – 10:00 PM',
    deliveryFee: 0
  },
  {
    id: 'loc-del-aerocity',
    name: 'Delhi NCR VIP Hub — Aerocity',
    type: 'HOTEL',
    address: 'Worldmark 1, Hospitality District, Aerocity, New Delhi',
    operatingHours: '24 Hours / 7 Days',
    deliveryFee: 500
  },
  {
    id: 'loc-goa-airport',
    name: 'Goa Coastal Pavilion — Dabolim & MOPA Airport',
    type: 'AIRPORT',
    address: 'VIP Arrival Lounge, Goa International Airport',
    operatingHours: '24 Hours / 7 Days',
    deliveryFee: 500
  },
  {
    id: 'loc-residence',
    name: 'Private White-Glove Doorstep Delivery',
    type: 'RESIDENCE',
    address: 'Direct to your residence, private villa, or corporate headquarters',
    operatingHours: '24 Hours / 7 Days',
    deliveryFee: 1200
  }
];

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  taxRate: 0.18, // 18% GST
  insuranceDailyRate: 1500, // Premium zero-dep insurance per day
  driverDailyRate: 1200, // Chauffeur allowance per day
  weekendMultiplier: 1.15, // 15% weekend rate bump
  depositPercentage: 0.20, // 20% advance booking deposit
  cancellationHoursLimit: 24
};

export const INITIAL_FEEDBACK: FeedbackItem[] = [
  {
    id: 'fb-1',
    author: 'Rahul K.',
    location: 'Bangalore',
    carId: 'porsche-911-gt3',
    carName: 'Porsche 911 GT3 (992)',
    rentalDurationDays: 3,
    rating: 5,
    date: '12 Oct 2026',
    comments: 'The 992 GT3 in Jet Black was delivered to our hotel in Bangalore exactly on time. Condition was 100% spotless. The 360 studio turntable gave us complete confidence before booking.',
    verifiedRental: true,
    suggestedFleet: 'Please bring the Ferrari 296 GTB or GT3 RS with Weissach package to the fleet next season!',
    conciergeResponse: 'Dear Rahul, thank you for choosing Velox Drive for your Bangalore tour. We have logged your request for the GT3 RS with our fleet acquisition committee.',
    sentiment: 'exceptional'
  },
  {
    id: 'fb-2',
    author: 'Vikramaditya Roy',
    location: 'Mumbai',
    carId: 'rolls-royce-ghost',
    carName: 'Rolls-Royce Ghost Extended',
    rentalDurationDays: 2,
    rating: 5,
    date: '08 Oct 2026',
    comments: 'Exceptional chauffeur service by Arjun. He navigated Mumbai traffic with serene poise. The champagne fridge and starlight roof made our gala evening magical.',
    verifiedRental: true,
    suggestedFleet: 'Mercedes-Maybach S680 or Rolls-Royce Spectre EV',
    conciergeResponse: 'Esteemed Mr. Roy, your commendation of Chauffeur Arjun has been shared with leadership. The Maybach S680 is scheduled to arrive in Q1 2027.',
    sentiment: 'exceptional'
  },
  {
    id: 'fb-3',
    author: 'Ayesha Merchant',
    location: 'Goa',
    carId: 'bentley-continental-gt',
    carName: 'Bentley Continental GT Speed',
    rentalDurationDays: 4,
    rating: 5,
    date: '04 Oct 2026',
    comments: 'Cruising the coastal highways in British Racing Green was unforgettable. Transparent pricing, no deposit headaches, refund was in my account 18 hours after drop-off.',
    verifiedRental: true,
    suggestedFleet: 'Aston Martin DB12 Volante convertible',
    conciergeResponse: 'Thank you Ayesha. We take pride in our rapid deposit release standard. The DB12 Volante is high on our luxury touring roadmap.',
    sentiment: 'exceptional'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'VLX-2026-8941',
    vehicleId: 'porsche-911-gt3',
    vehicleName: 'Porsche 911 GT3 (992)',
    vehicleCategory: 'Sports',
    pickupLocation: 'Bangalore Int. Airport (BLR T2 VIP Curbside)',
    dropoffLocation: 'Bangalore Int. Airport (BLR T2 VIP Curbside)',
    pickupDate: '2026-10-12',
    pickupTime: '10:00',
    returnDate: '2026-10-15',
    returnTime: '18:00',
    durationDays: 3,
    driverOption: 'SELF_DRIVE',
    driverFee: 0,
    insuranceOption: 'PREMIUM_ZERO_DEP',
    insuranceFee: 4500,
    baseRental: 50997,
    taxes: 9989,
    securityDeposit: 20000,
    total: 85486,
    paidAmount: 85486,
    balanceAmount: 0,
    paymentStructure: 'FULL',
    status: 'CONFIRMED',
    depositPaid: true,
    depositAmount: 85486,
    depositTransactionId: 'TXN-DEP-84920',
    depositPaidAt: '2026-10-02T14:32:00Z',
    customerName: 'Rahul K.',
    customerEmail: 'rahul.k@example.com',
    customerPhone: '+91 98201 44821',
    licenseNumber: 'KA01 20200049210',
    licenseVerified: true,
    createdAt: '2026-10-02T14:30:00Z'
  },
  {
    id: 'VLX-2026-7729',
    vehicleId: 'rolls-royce-ghost',
    vehicleName: 'Rolls-Royce Ghost Extended',
    vehicleCategory: 'Luxury',
    pickupLocation: 'Mumbai BKC Signature Showroom',
    dropoffLocation: 'Mumbai BKC Signature Showroom',
    pickupDate: '2026-10-18',
    pickupTime: '14:00',
    returnDate: '2026-10-20',
    returnTime: '12:00',
    durationDays: 2,
    driverOption: 'WITH_DRIVER',
    driverFee: 2400,
    insuranceOption: 'PREMIUM_ZERO_DEP',
    insuranceFee: 3000,
    baseRental: 49998,
    taxes: 9971,
    securityDeposit: 30000,
    total: 95369,
    paidAmount: 50000,
    balanceAmount: 45369,
    paymentStructure: 'DEPOSIT',
    status: 'ACTIVE',
    depositPaid: true,
    depositAmount: 50000,
    depositTransactionId: 'TXN-DEP-77291',
    depositPaidAt: '2026-10-01T09:18:00Z',
    customerName: 'Vikramaditya Roy',
    customerEmail: 'v.roy@holdings.in',
    customerPhone: '+91 98110 99420',
    licenseVerified: true,
    createdAt: '2026-10-01T09:15:00Z'
  },
  {
    id: 'VLX-2026-9041',
    vehicleId: 'porsche-911-gt3',
    vehicleName: 'Porsche 911 GT3 (992)',
    vehicleCategory: 'Sports',
    pickupLocation: 'Bangalore Int. Airport (BLR T2 VIP Curbside)',
    dropoffLocation: 'Bangalore Int. Airport (BLR T2 VIP Curbside)',
    pickupDate: '2026-10-24',
    pickupTime: '11:00',
    returnDate: '2026-10-26',
    returnTime: '17:00',
    durationDays: 2,
    driverOption: 'SELF_DRIVE',
    driverFee: 0,
    insuranceOption: 'PREMIUM_ZERO_DEP',
    insuranceFee: 3000,
    baseRental: 49998,
    taxes: 9539,
    securityDeposit: 20000,
    total: 82537,
    paidAmount: 0,
    balanceAmount: 82537,
    paymentStructure: 'DEPOSIT',
    status: 'PAYMENT_PENDING',
    depositPaid: false,
    depositAmount: 19539,
    customerName: 'Aditya Sen',
    customerEmail: 'aditya.sen@investments.in',
    customerPhone: '+91 98300 78219',
    licenseNumber: 'KA03 20190018491',
    licenseVerified: true,
    createdAt: '2026-10-10T11:20:00Z'
  }
];
