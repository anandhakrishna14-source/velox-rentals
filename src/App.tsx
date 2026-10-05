import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { QuickBookingBar } from './components/QuickBookingBar';
import { CarModelAssembly3D } from './components/3d/CarModelAssembly3D';
import { ExperiencePillarsSection } from './components/ExperiencePillarsSection';
import { FleetSection } from './components/FleetSection';
import { AiDriveAssistant } from './components/AiDriveAssistant';
import { ExperienceSection } from './components/ExperienceSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { TrustCenterSection } from './components/TrustCenterSection';
import { FeedbackSection } from './components/FeedbackSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';

// Modals
import { VehicleModal } from './components/VehicleModal';
import { BookingModal } from './components/BookingModal';
import { MyBookingsModal, TabType } from './components/MyBookingsModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CompareCarsDrawer } from './components/CompareCarsDrawer';
import { DigitalRentalPassModal } from './components/DigitalRentalPassModal';
import { VehicleConditionModal } from './components/VehicleConditionModal';
import { EmergencyAssistanceModal } from './components/EmergencyAssistanceModal';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AuthProvider } from './context/AuthContext';

import {
  INITIAL_VEHICLES,
  INITIAL_LOCATIONS,
  DEFAULT_PRICING_SETTINGS,
  INITIAL_BOOKINGS,
  INITIAL_FEEDBACK
} from './data/vehicles';
import {
  Vehicle,
  Booking,
  LocationOption,
  PricingSettings,
  FeedbackItem,
  VehicleCondition,
  DriverOption
} from './types';

export default function App() {
  // Global State
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('velox_vehicles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some((v: any) => v.id === 'porsche-911-gt3' || v.id === 'rolls-royce-ghost')) {
          return parsed;
        }
      } catch {}
    }
    return INITIAL_VEHICLES;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('velox_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(() => {
    const saved = localStorage.getItem('velox_feedback');
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACK;
  });

  const [locations, setLocations] = useState<LocationOption[]>(INITIAL_LOCATIONS);
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>(() => {
    const saved = localStorage.getItem('velox_pricing');
    return saved ? JSON.parse(saved) : DEFAULT_PRICING_SETTINGS;
  });

  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('velox_wishlist');
    return saved ? JSON.parse(saved) : ['porsche-911-gt3', 'rolls-royce-ghost'];
  });

  // Comparison State (up to 3 cars)
  const [compareCarIds, setCompareCarIds] = useState<string[]>([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState<boolean>(false);

  // Active Search / Filter Dates (from QuickBookingBar)
  const [activeDateFilter, setActiveDateFilter] = useState<{
    pickup: string;
    returnDate: string;
    location: string;
    locationId: string;
    driverOption: DriverOption;
  } | undefined>(undefined);

  // Modals Controller
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<Vehicle | null>(null);
  const [showMyBookings, setShowMyBookings] = useState<boolean>(false);
  const [myBookingsInitialTab, setMyBookingsInitialTab] = useState<TabType>('UPCOMING');
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);
  const [activePassBooking, setActivePassBooking] = useState<Booking | null>(null);
  const [activeInspectionBooking, setActiveInspectionBooking] = useState<Booking | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('velox_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('velox_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('velox_feedback', JSON.stringify(feedbackItems));
  }, [feedbackItems]);

  useEffect(() => {
    localStorage.setItem('velox_pricing', JSON.stringify(pricingSettings));
  }, [pricingSettings]);

  useEffect(() => {
    localStorage.setItem('velox_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Wishlist toggle
  const handleToggleWishlist = (id: string) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Compare car toggle
  const handleToggleCompare = (id: string) => {
    setCompareCarIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 vehicles simultaneously.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleRemoveCompareCar = (id: string) => {
    setCompareCarIds(prev => prev.filter(item => item !== id));
  };

  // Currency toggle
  const handleToggleCurrency = () => {
    setCurrency(prev => (prev === 'INR' ? 'USD' : 'INR'));
  };

  // Book vehicle handler
  const handleStartBooking = (vehicle: Vehicle) => {
    setSelectedVehicleForDetail(null);
    setShowCompareDrawer(false);
    setSelectedVehicleForBooking(vehicle);
  };

  const handleGenericBookNow = () => {
    const carToBook = vehicles.find(v => v.id === 'porsche-911-gt3') || vehicles[0];
    handleStartBooking(carToBook);
  };

  // Quick booking bar search submit
  const handleQuickSearch = (params: {
    pickupLocId: string;
    dropoffLocId: string;
    pickupDate: string;
    returnDate: string;
    driverOption: DriverOption;
  }) => {
    const locName = locations.find(l => l.id === params.pickupLocId)?.name || 'Bangalore Int. Airport';
    setActiveDateFilter({
      pickup: params.pickupDate,
      returnDate: params.returnDate,
      location: locName,
      locationId: params.pickupLocId,
      driverOption: params.driverOption
    });

    // Smooth scroll to fleet section
    const el = document.getElementById('fleet-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  // Experience category jump
  const handleSelectExperienceCategory = (categoryName: string) => {
    const el = document.getElementById('fleet-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  // Booking confirmed callback
  const handleBookingConfirmed = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
  };

  // Booking cancel callback
  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b))
    );
  };

  // Booking reschedule callback
  const handleRescheduleBooking = (bookingId: string, newPickupDate: string, newReturnDate: string) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              pickupDate: newPickupDate,
              returnDate: newReturnDate
            }
          : b
      )
    );
  };

  // Add customer feedback
  const handleAddFeedback = (newFeedback: FeedbackItem) => {
    setFeedbackItems(prev => [newFeedback, ...prev]);
  };

  // Admin vehicle updates
  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => (v.id === updatedVehicle.id ? updatedVehicle : v)));
  };

  const handleAddVehicle = (newVehicle: Vehicle) => {
    setVehicles(prev => [newVehicle, ...prev]);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
  };

  const handleUpdateBookingStatus = (bookingId: string, status: any) => {
    setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status } : b)));
  };

  const availableCarsCount = vehicles.filter(v => v.available).length;

  return (
    <AuthProvider>
      <AdminAuthProvider>
        <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col font-sans selection:bg-[#C9A45C]/30 selection:text-white">
        {/* 1. Refined Navigation Bar */}
      <Navbar
        currency={currency}
        wishlistCount={wishlist.length}
        compareCount={compareCarIds.length}
        onToggleCurrency={handleToggleCurrency}
        onOpenMyBookings={() => {
          setMyBookingsInitialTab('UPCOMING');
          setShowMyBookings(true);
        }}
        onOpenEmergency={() => {
          setMyBookingsInitialTab('EMERGENCY');
          setShowMyBookings(true);
        }}
        onOpenAdmin={() => setShowAdminDashboard(true)}
        onOpenCompare={() => setShowCompareDrawer(true)}
        onBookNow={handleGenericBookNow}
      />

      {/* Main Page Layout */}
      <main className="flex-1">
        {/* 2. Cinematic Hero */}
        <HeroSection
          onExploreCars={() => {
            const el = document.getElementById('fleet-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onBookDrive={handleGenericBookNow}
        />

        {/* 3. Compact Booking Bar Immediately Below Hero (Item 1 & 2) */}
        <QuickBookingBar
          locations={locations}
          onFindCars={handleQuickSearch}
          availableCount={availableCarsCount}
          totalCount={vehicles.length}
        />

        {/* 4. Stages 1 to 7: Porsche 911 GT3 (992) Video Turntable Assembly Experience */}
        <CarModelAssembly3D
          onBookCar={vehicleId => {
            const car = vehicles.find(v => v.id === vehicleId) || vehicles[0];
            handleStartBooking(car);
          }}
          onExploreFleet={() => {
            const el = document.getElementById('fleet-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 5. "More Than A Rental" Experience Pillars Section (Item 16) */}
        <ExperiencePillarsSection
          onSelectExperience={handleSelectExperienceCategory}
          onBookNow={handleGenericBookNow}
        />

        {/* 6. The Fleet Section with Real-Time Availability Grouping & Comparison (Item 2 & 3) */}
        <FleetSection
          vehicles={vehicles}
          currency={currency}
          wishlist={wishlist}
          selectedCompareIds={compareCarIds}
          onToggleWishlist={handleToggleWishlist}
          onToggleCompare={handleToggleCompare}
          onOpenCompare={() => setShowCompareDrawer(true)}
          onSelectVehicle={car => setSelectedVehicleForDetail(car)}
          onBookVehicle={car => handleStartBooking(car)}
          filterDates={activeDateFilter}
        />

        {/* 7. AI Concierge & Personalized Drive Matchmaker (AI Feature) */}
        <AiDriveAssistant
          vehicles={vehicles}
          onSelectVehicle={car => setSelectedVehicleForDetail(car)}
          onBookVehicle={car => handleStartBooking(car)}
        />

        {/* 8. White-Glove Client Privileges */}
        <ExperienceSection />

        {/* 9. How It Works (3-Step Journey) */}
        <HowItWorksSection onBookNow={handleGenericBookNow} />

        {/* 10. Trust Center Section (Item 12: Drive with Confidence) */}
        <TrustCenterSection />

        {/* 11. Verified Reviews & Suggestions Section (Feedback Section) */}
        <FeedbackSection
          feedbackItems={feedbackItems}
          vehicles={vehicles}
          onAddFeedback={handleAddFeedback}
        />

        {/* 12. About & FAQs */}
        <AboutSection />
      </main>

      {/* 13. Footer */}
      <Footer
        onOpenMyBookings={() => setShowMyBookings(true)}
        onOpenAdmin={() => setShowAdminDashboard(true)}
        onBookNow={handleGenericBookNow}
      />

      {/* MODAL 1: 3D Vehicle Inspection with Clickable Hotspots */}
      {selectedVehicleForDetail && (
        <VehicleModal
          vehicle={selectedVehicleForDetail}
          currency={currency}
          isWishlisted={wishlist.includes(selectedVehicleForDetail.id)}
          onClose={() => setSelectedVehicleForDetail(null)}
          onToggleWishlist={handleToggleWishlist}
          onBookNow={car => handleStartBooking(car)}
        />
      )}

      {/* MODAL 2: "Build Your Rental" Multi-Step Booking Modal */}
      {selectedVehicleForBooking && (
        <BookingModal
          vehicle={selectedVehicleForBooking}
          locations={locations}
          pricingSettings={pricingSettings}
          currency={currency}
          initialDates={activeDateFilter}
          onClose={() => setSelectedVehicleForBooking(null)}
          onBookingConfirmed={handleBookingConfirmed}
          onOpenMyBookings={() => setShowMyBookings(true)}
          onOpenPass={booking => setActivePassBooking(booking)}
        />
      )}

      {/* MODAL 3: Digital Rental Pass (Boarding Pass Style) */}
      {activePassBooking && (
        <DigitalRentalPassModal
          booking={activePassBooking}
          onClose={() => setActivePassBooking(null)}
          onViewVehicle={() => {
            const v = vehicles.find(veh => veh.id === activePassBooking.vehicleId) || vehicles[0];
            setActivePassBooking(null);
            setSelectedVehicleForDetail(v);
          }}
        />
      )}

      {/* MODAL 4: Vehicle Condition 360° Inspection Log */}
      {activeInspectionBooking && (
        <VehicleConditionModal
          booking={activeInspectionBooking}
          onClose={() => setActiveInspectionBooking(null)}
          onSaveInspection={cond => {
            alert('Digital Condition Log saved to booking audit trail.');
          }}
        />
      )}

      {/* MODAL 5: Side-by-Side Car Comparison Drawer */}
      {showCompareDrawer && (
        <CompareCarsDrawer
          vehicles={vehicles}
          selectedCarIds={compareCarIds}
          currency={currency}
          onClose={() => setShowCompareDrawer(false)}
          onRemoveCar={handleRemoveCompareCar}
          onBookCar={car => handleStartBooking(car)}
          onView3D={car => {
            setShowCompareDrawer(false);
            setSelectedVehicleForDetail(car);
          }}
        />
      )}

      {/* MODAL 6: Client Portal & My Bookings (with Emergency Assistance Tab) */}
      {showMyBookings && (
        <MyBookingsModal
          bookings={bookings}
          currency={currency}
          initialTab={myBookingsInitialTab}
          onClose={() => setShowMyBookings(false)}
          onCancelBooking={handleCancelBooking}
          onRescheduleBooking={handleRescheduleBooking}
          onOpenDigitalPass={b => setActivePassBooking(b)}
          onOpenInspection={b => setActiveInspectionBooking(b)}
        />
      )}

      {/* MODAL 8: Standalone Emergency Assistance Cockpit */}
      {showEmergencyModal && (
        <EmergencyAssistanceModal
          bookings={bookings}
          activeBooking={bookings.find(b => b.status === 'ACTIVE') || bookings[0]}
          onClose={() => setShowEmergencyModal(false)}
        />
      )}

      {/* MODAL 7: Dark Luxury Admin Management Console */}
      {showAdminDashboard && (
        <AdminDashboard
          vehicles={vehicles}
          bookings={bookings}
          locations={locations}
          pricingSettings={pricingSettings}
          currency={currency}
          onClose={() => setShowAdminDashboard(false)}
          onUpdateVehicle={handleUpdateVehicle}
          onAddVehicle={handleAddVehicle}
          onDeleteVehicle={handleDeleteVehicle}
          onUpdateBookingStatus={handleUpdateBookingStatus}
          onUpdatePricingSettings={setPricingSettings}
        />
      )}

      {/* Global Admin Login Authentication Modal */}
      <AdminLoginModal />
    </div>
  </AdminAuthProvider>
</AuthProvider>
  );
}
