import React, { useState } from 'react';
import {
  X,
  LayoutDashboard,
  Car,
  CalendarCheck,
  Users,
  DollarSign,
  MapPin,
  FileCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  Eye,
  Settings,
  Radio,
  LogOut
} from 'lucide-react';
import { Vehicle, Booking, LocationOption, PricingSettings } from '../types';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminDashboardProps {
  vehicles: Vehicle[];
  bookings: Booking[];
  locations: LocationOption[];
  pricingSettings: PricingSettings;
  currency: 'INR' | 'USD';
  onClose: () => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onAddVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (vehicleId: string) => void;
  onUpdateBookingStatus: (bookingId: string, status: any) => void;
  onUpdatePricingSettings: (settings: PricingSettings) => void;
}

type AdminTab = 'OVERVIEW' | 'FLEET' | 'BOOKINGS' | 'CUSTOMERS' | 'PRICING' | 'LOCATIONS';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  vehicles,
  bookings,
  locations,
  pricingSettings,
  currency,
  onClose,
  onUpdateVehicle,
  onAddVehicle,
  onDeleteVehicle,
  onUpdateBookingStatus,
  onUpdatePricingSettings
}) => {
  const { logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Editing state for vehicle
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState<boolean>(false);

  // New vehicle form state
  const [newCarName, setNewCarName] = useState<string>('');
  const [newCarCategory, setNewCarCategory] = useState<any>('Sports');
  const [newCarPrice, setNewCarPrice] = useState<number>(8999);
  const [newCarHorsepower, setNewCarHorsepower] = useState<number>(380);

  // Pricing settings draft
  const [pricingDraft, setPricingDraft] = useState<PricingSettings>(pricingSettings);
  const [activeSosIncident] = useState<any>(() => {
    const saved = localStorage.getItem('velox_active_incident');
    return saved ? JSON.parse(saved) : null;
  });

  const formatPrice = (priceInr: number) => {
    if (currency === 'USD') {
      const usdPrice = Math.round(priceInr / 85);
      return `$${usdPrice.toLocaleString()}`;
    }
    return `₹${priceInr.toLocaleString('en-IN')}`;
  };

  // KPIs
  const totalRevenue = bookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const activeBookingsCount = bookings.filter(b => b.status === 'ACTIVE' || b.status === 'CONFIRMED').length;
  const availableVehiclesCount = vehicles.filter(v => v.available).length;
  const fleetUtilizationRate = Math.round(((vehicles.length - availableVehiclesCount) / vehicles.length) * 100);

  const handleSaveVehicleEdit = () => {
    if (!editingVehicle) return;
    onUpdateVehicle(editingVehicle);
    setEditingVehicle(null);
  };

  const handleCreateVehicle = () => {
    if (!newCarName) return;
    const slug = newCarName.toLowerCase().replace(/\s+/g, '-');
    const created: Vehicle = {
      id: slug,
      slug,
      name: newCarName,
      tagline: 'Precision luxury performance edition',
      category: newCarCategory,
      seats: 2,
      transmission: 'Dual-Clutch PDK',
      fuel: 'Petrol',
      horsepower: newCarHorsepower,
      acceleration0To100: 4.2,
      topSpeed: 305,
      drivetrain: 'Rear-Wheel Drive',
      dailyPrice: newCarPrice,
      weekendPrice: Math.round(newCarPrice * 1.15),
      securityDeposit: 15000,
      available: true,
      colors: [
        { name: 'Onyx Black', hex: '#15171C' },
        { name: 'Titanium', hex: '#585C63' },
        { name: 'Gold', hex: '#C9A45C' }
      ],
      features: ['Active Sport Exhaust', 'Carbon Composite Brakes', 'Launch Control'],
      requirements: ['Valid driving license', 'Age 21+'],
      description: 'Handcrafted luxury and motorsport engineering.',
      rating: 5.0,
      reviewsCount: 1,
      reviews: []
    };
    onAddVehicle(created);
    setShowAddVehicleModal(false);
    setNewCarName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#090A0C] border border-[#2B2D33] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#060708]">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-[#C9A45C] font-semibold">
              VELOX DRIVE ADMIN CONSOLE
            </span>
            <span className="text-white/20">|</span>
            <span className="text-xs text-[#888888] font-mono-num">SECURE FLEET OPS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 hover:text-white text-xs font-mono-num transition-colors cursor-pointer flex items-center gap-1.5"
              title="Logout from Admin Mode"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Admin</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#999999] hover:text-white transition-colors cursor-pointer"
              aria-label="Close admin dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/5 bg-[#0C0D10] overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
            { id: 'FLEET', label: 'Fleet Management', icon: Car },
            { id: 'BOOKINGS', label: 'Bookings & Refunds', icon: CalendarCheck },
            { id: 'CUSTOMERS', label: 'Customer Verifications', icon: Users },
            { id: 'PRICING', label: 'Pricing Rules', icon: DollarSign },
            { id: 'LOCATIONS', label: 'Hub Locations', icon: MapPin }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#C9A45C] text-[#C9A45C]'
                    : 'border-transparent text-[#777777] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* ======================================================== */}
          {/* TAB 1: OVERVIEW */}
          {/* ======================================================== */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Emergency Roadside SOS Live Telemetry Alert */}
              {activeSosIncident && (
                <div className="p-4 bg-gradient-to-r from-[#200D0D] to-[#120B0B] border border-[#E66A6A]/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E66A6A]/20 border border-[#E66A6A] flex items-center justify-center text-[#E66A6A] shrink-0">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono-num font-bold bg-[#E66A6A] text-white px-2 py-0.5 rounded">
                          PRIORITY EMERGENCY SOS
                        </span>
                        <span className="text-xs text-white font-bold">
                          {activeSosIncident.vehicleName} ({activeSosIncident.incidentType?.replace('_', ' ')})
                        </span>
                      </div>
                      <div className="text-xs text-[#CCCCCC] mt-0.5">
                        Location: {activeSosIncident.locationAddress} · ETA: {activeSosIncident.etaMinutes}m · Dispatch: {activeSosIncident.recoveryVehicle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${activeSosIncident.dispatcherPhone}`}
                      className="py-1.5 px-3 bg-[#E66A6A] hover:bg-[#F87171] text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      Call Tech ({activeSosIncident.dispatcherName?.split(' ')[0]})
                    </a>
                  </div>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-[#101115] border border-white/5 rounded-xl">
                  <div className="text-xs text-[#777777] uppercase tracking-wider mb-1">Total Revenue</div>
                  <div className="text-2xl font-luxury font-bold text-white font-mono-num">
                    {formatPrice(totalRevenue)}
                  </div>
                  <div className="text-[11px] text-[#5ED39A] mt-1">+18.4% from last period</div>
                </div>

                <div className="p-5 bg-[#101115] border border-white/5 rounded-xl">
                  <div className="text-xs text-[#777777] uppercase tracking-wider mb-1">Active Bookings</div>
                  <div className="text-2xl font-luxury font-bold text-white font-mono-num">
                    {activeBookingsCount}
                  </div>
                  <div className="text-[11px] text-[#C9A45C] mt-1">Confirmed & Scheduled</div>
                </div>

                <div className="p-5 bg-[#101115] border border-white/5 rounded-xl">
                  <div className="text-xs text-[#777777] uppercase tracking-wider mb-1">Fleet Availability</div>
                  <div className="text-2xl font-luxury font-bold text-white font-mono-num">
                    {availableVehiclesCount} / {vehicles.length}
                  </div>
                  <div className="text-[11px] text-[#5ED39A] mt-1">Ready for Immediate Delivery</div>
                </div>

                <div className="p-5 bg-[#101115] border border-white/5 rounded-xl">
                  <div className="text-xs text-[#777777] uppercase tracking-wider mb-1">Fleet Utilization</div>
                  <div className="text-2xl font-luxury font-bold text-white font-mono-num">
                    {fleetUtilizationRate}%
                  </div>
                  <div className="text-[11px] text-[#AAAAAA] mt-1">Optimal luxury threshold</div>
                </div>
              </div>

              {/* Recent Bookings Quick Table */}
              <div className="p-5 bg-[#101115] border border-white/5 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                    Live Bookings Activity
                  </h4>
                  <button
                    onClick={() => setActiveTab('BOOKINGS')}
                    className="text-xs text-[#C9A45C] hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-[#777777] pb-2 font-mono-num">
                        <th className="py-2.5 font-medium">BOOKING ID</th>
                        <th className="py-2.5 font-medium">VEHICLE</th>
                        <th className="py-2.5 font-medium">CUSTOMER</th>
                        <th className="py-2.5 font-medium">DATES</th>
                        <th className="py-2.5 font-medium">AMOUNT</th>
                        <th className="py-2.5 font-medium">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 font-mono-num text-[#C9A45C]">{b.id}</td>
                          <td className="py-3 font-semibold text-white">{b.vehicleName}</td>
                          <td className="py-3 text-[#AAAAAA]">{b.customerName}</td>
                          <td className="py-3 text-[#777777]">{b.pickupDate} to {b.returnDate}</td>
                          <td className="py-3 font-mono-num text-white">{formatPrice(b.total)}</td>
                          <td className="py-3">
                            <span className="text-[10px] bg-[#5ED39A]/10 text-[#5ED39A] px-2 py-0.5 rounded font-semibold">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: FLEET MANAGEMENT */}
          {/* ======================================================== */}
          {activeTab === 'FLEET' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-luxury text-white">Fleet Inventory</h3>
                  <p className="text-xs text-[#888888]">Manage vehicle pricing, availability, and specifications.</p>
                </div>

                <button
                  onClick={() => setShowAddVehicleModal(true)}
                  className="py-2 px-4 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Vehicle</span>
                </button>
              </div>

              {/* Fleet Table */}
              <div className="bg-[#101115] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#14151B] border-b border-white/10 text-[#777777] font-mono-num">
                    <tr>
                      <th className="p-4">VEHICLE</th>
                      <th className="p-4">CATEGORY</th>
                      <th className="p-4">SPECS</th>
                      <th className="p-4">DAILY RATE</th>
                      <th className="p-4">AVAILABILITY</th>
                      <th className="p-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {vehicles.map(v => (
                      <tr key={v.id} className="hover:bg-white/[0.02]">
                        <td className="p-4">
                          <div className="font-semibold text-white">{v.name}</div>
                          <div className="text-[11px] text-[#777777]">{v.tagline}</div>
                        </td>
                        <td className="p-4 text-[#C9A45C]">{v.category}</td>
                        <td className="p-4 text-[#999999] font-mono-num">
                          {v.horsepower} HP · {v.seats} Seats · {v.transmission}
                        </td>
                        <td className="p-4 font-mono-num text-white font-semibold">
                          {formatPrice(v.dailyPrice)}/day
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => onUpdateVehicle({ ...v, available: !v.available })}
                            className={`px-2.5 py-1 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                              v.available
                                ? 'bg-[#5ED39A]/15 text-[#5ED39A]'
                                : 'bg-[#E66A6A]/15 text-[#E66A6A]'
                            }`}
                          >
                            {v.available ? 'AVAILABLE' : 'RESERVED'}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingVehicle(v)}
                              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-[#CCCCCC] hover:text-white"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove vehicle ${v.name} from fleet?`)) {
                                  onDeleteVehicle(v.id);
                                }
                              }}
                              className="p-1.5 rounded bg-[#E66A6A]/10 hover:bg-[#E66A6A]/20 text-[#E66A6A]"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: BOOKINGS & REFUNDS */}
          {/* ======================================================== */}
          {activeTab === 'BOOKINGS' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-luxury text-white">All Bookings & Concurrency Lock</h3>
                <p className="text-xs text-[#888888]">
                  Enforce vehicle schedule integrity, process manual approvals, cancellations, and refunds.
                </p>
              </div>

              <div className="space-y-3">
                {bookings.map(b => (
                  <div
                    key={b.id}
                    className="p-5 bg-[#101115] border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-white text-sm">{b.vehicleName}</span>
                        <span className="text-xs font-mono-num text-[#C9A45C] bg-[#C9A45C]/10 px-2 py-0.5 rounded">
                          {b.id}
                        </span>
                        <span className="text-xs text-[#888888] font-mono-num">
                          {b.pickupDate} to {b.returnDate}
                        </span>
                      </div>
                      <div className="text-xs text-[#AAAAAA]">
                        Customer: <strong className="text-white">{b.customerName}</strong> ({b.customerPhone}) · Driver: {b.driverOption}
                      </div>
                      <div className="text-xs font-mono-num text-[#888888] mt-1">
                        Total: {formatPrice(b.total)} · Paid: {formatPrice(b.paidAmount)} · Balance: {formatPrice(b.balanceAmount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={b.status}
                        onChange={e => onUpdateBookingStatus(b.id, e.target.value)}
                        className="bg-[#181920] border border-[#333] text-xs text-white rounded-lg p-2 focus:border-[#C9A45C]"
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="REFUNDED">REFUNDED</option>
                      </select>

                      {b.status === 'CANCELLED' && (
                        <button
                          onClick={() => {
                            alert(`Refund of ${formatPrice(b.paidAmount)} processed to customer card.`);
                            onUpdateBookingStatus(b.id, 'REFUNDED');
                          }}
                          className="py-2 px-3 bg-[#5ED39A]/15 hover:bg-[#5ED39A]/25 text-[#5ED39A] text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          Process Refund
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: CUSTOMER VERIFICATIONS */}
          {/* ======================================================== */}
          {activeTab === 'CUSTOMERS' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-luxury text-white">Identity & Licence Verifications</h3>
                <p className="text-xs text-[#888888]">
                  Review simulated compliance submissions according to privacy standards.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-[#101115] border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Aditya Sen</span>
                    <span className="text-[10px] bg-[#5ED39A]/15 text-[#5ED39A] px-2 py-0.5 rounded font-semibold">
                      VERIFIED APPROVED
                    </span>
                  </div>
                  <div className="text-xs text-[#888888] space-y-1">
                    <div><strong>Licence ID:</strong> MH02 20180049210</div>
                    <div><strong>Driver Age:</strong> 26 years</div>
                    <div><strong>Document Hash:</strong> SHA256-VALID-TOKEN</div>
                  </div>
                </div>

                <div className="p-5 bg-[#101115] border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Vikramaditya Roy</span>
                    <span className="text-[10px] bg-[#C9A45C]/15 text-[#C9A45C] px-2 py-0.5 rounded font-semibold">
                      CHAUFFEUR SERVICE (EXEMPT)
                    </span>
                  </div>
                  <div className="text-xs text-[#888888] space-y-1">
                    <div><strong>Status:</strong> VIP Chauffeur Selected</div>
                    <div><strong>Driver:</strong> Rajesh Sharma (Assigned)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: PRICING RULES */}
          {/* ======================================================== */}
          {activeTab === 'PRICING' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-xl font-luxury text-white">Pricing & Deposit Rules</h3>
                <p className="text-xs text-[#888888]">Configure company tax, insurance, and weekend multipliers.</p>
              </div>

              <div className="p-6 bg-[#101115] border border-white/5 rounded-2xl space-y-4">
                <div>
                  <label className="block text-xs text-[#AAAAAA] mb-1">
                    Goods & Services Tax (GST) Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingDraft.taxRate}
                    onChange={e => setPricingDraft({ ...pricingDraft, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#181920] border border-[#333] rounded-lg p-2.5 text-xs text-white"
                  />
                  <span className="text-[11px] text-[#777777]">e.g. 0.18 for 18%</span>
                </div>

                <div>
                  <label className="block text-xs text-[#AAAAAA] mb-1">
                    Zero-Depreciation Insurance Daily Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={pricingDraft.insuranceDailyRate}
                    onChange={e => setPricingDraft({ ...pricingDraft, insuranceDailyRate: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#181920] border border-[#333] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#AAAAAA] mb-1">
                    Chauffeur Daily Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={pricingDraft.driverDailyRate}
                    onChange={e => setPricingDraft({ ...pricingDraft, driverDailyRate: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#181920] border border-[#333] rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onUpdatePricingSettings(pricingDraft);
                      alert('Pricing rules updated successfully!');
                    }}
                    className="py-2.5 px-6 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs uppercase rounded-lg cursor-pointer"
                  >
                    Save Pricing Rules
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: LOCATIONS */}
          {/* ======================================================== */}
          {activeTab === 'LOCATIONS' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-luxury text-white">Hub & Handover Terminals</h3>
                <p className="text-xs text-[#888888]">Operating hours, airport valet lanes, and concierge hubs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {locations.map(loc => (
                  <div key={loc.id} className="p-5 bg-[#101115] border border-white/5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{loc.name}</span>
                      <span className="text-[10px] text-[#C9A45C] uppercase">{loc.type}</span>
                    </div>
                    <p className="text-xs text-[#888888]">{loc.address}</p>
                    <div className="text-[11px] text-[#5ED39A]">Hours: {loc.operatingHours}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit Vehicle Modal */}
        {editingVehicle && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#131418] border border-[#C9A45C]/50 rounded-2xl p-6 space-y-4">
              <h4 className="text-lg font-luxury text-white">Edit {editingVehicle.name}</h4>

              <div>
                <label className="block text-xs text-[#AAAAAA] mb-1">Daily Price (₹)</label>
                <input
                  type="number"
                  value={editingVehicle.dailyPrice}
                  onChange={e => setEditingVehicle({ ...editingVehicle, dailyPrice: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#1C1D24] border border-[#333] rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-[#AAAAAA] mb-1">Weekend Price (₹)</label>
                <input
                  type="number"
                  value={editingVehicle.weekendPrice}
                  onChange={e => setEditingVehicle({ ...editingVehicle, weekendPrice: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#1C1D24] border border-[#333] rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-[#AAAAAA] mb-1">Horsepower</label>
                <input
                  type="number"
                  value={editingVehicle.horsepower}
                  onChange={e => setEditingVehicle({ ...editingVehicle, horsepower: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#1C1D24] border border-[#333] rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-[#AAAAAA] mb-1">Car Picture URL (JPG/PNG)</label>
                <input
                  type="url"
                  value={editingVehicle.imageUrl || ''}
                  placeholder="https://images.unsplash.com/..."
                  onChange={e => setEditingVehicle({ ...editingVehicle, imageUrl: e.target.value })}
                  className="w-full bg-[#1C1D24] border border-[#333] rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-[#AAAAAA] mb-1">3D View Space Video URL (MP4/WebM)</label>
                <input
                  type="url"
                  value={editingVehicle.videoUrl || ''}
                  placeholder="https://example.com/turntable.mp4"
                  onChange={e => setEditingVehicle({ ...editingVehicle, videoUrl: e.target.value })}
                  className="w-full bg-[#1C1D24] border border-[#333] rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingVehicle(null)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVehicleEdit}
                  className="flex-1 py-2 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-semibold rounded-lg text-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Vehicle Modal */}
        {showAddVehicleModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#131418] border border-[#C9A45C]/50 rounded-2xl p-6 space-y-4">
              <h4 className="text-lg font-luxury text-white">Add New Fleet Vehicle</h4>

              <div>
                <label className="block text-xs text-[#AAAAAA] mb-1">Vehicle Model Name</label>
                <input
                  type="text"
                  placeholder="e.g. Zenith GT"
                  value={newCarName}
                  onChange={e => setNewCarName(e.target.value)}
                  className="w-full bg-[#1C1D24] border border-[#333] rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-[#AAAAAA] mb-1">Category</label>
                <select
                  value={newCarCategory}
                  onChange={e => setNewCarCategory(e.target.value)}
                  className="w-full bg-[#1C1D24] border border-[#333] rounded-lg p-2 text-xs text-white"
                >
                  <option value="Sports">Sports</option>
                  <option value="Performance">Performance</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Comfort">Comfort</option>
                  <option value="Luxury SUV">Luxury SUV</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#AAAAAA] mb-1">Daily Price (₹)</label>
                <input
                  type="number"
                  value={newCarPrice}
                  onChange={e => setNewCarPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#1C1D24] border border-[#333] rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-[#AAAAAA] mb-1">Horsepower (HP)</label>
                <input
                  type="number"
                  value={newCarHorsepower}
                  onChange={e => setNewCarHorsepower(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#1C1D24] border border-[#333] rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddVehicleModal(false)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateVehicle}
                  className="flex-1 py-2 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-semibold rounded-lg text-xs"
                >
                  Create Vehicle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
