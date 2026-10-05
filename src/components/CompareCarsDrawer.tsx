import React from 'react';
import { X, Check, ArrowRight, ShieldCheck, Zap, Gauge, Users, Compass, DollarSign, Trash2 } from 'lucide-react';
import { Vehicle } from '../types';

interface CompareCarsDrawerProps {
  vehicles: Vehicle[];
  selectedCarIds: string[];
  currency: 'INR' | 'USD';
  onClose: () => void;
  onRemoveCar: (carId: string) => void;
  onBookCar: (vehicle: Vehicle) => void;
  onView3D: (vehicle: Vehicle) => void;
}

export const CompareCarsDrawer: React.FC<CompareCarsDrawerProps> = ({
  vehicles,
  selectedCarIds,
  currency,
  onClose,
  onRemoveCar,
  onBookCar,
  onView3D
}) => {
  const comparedCars = vehicles.filter(v => selectedCarIds.includes(v.id));

  const formatPrice = (priceInr: number) => {
    if (currency === 'USD') {
      const usd = Math.round(priceInr / 85);
      return `$${usd.toLocaleString()}`;
    }
    return `₹${priceInr.toLocaleString('en-IN')}`;
  };

  if (comparedCars.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0D0E12] border border-[#2B2D35] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#090A0C]">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-[#C9A45C] font-semibold">
              VELOX COMPARISON MATRIX
            </span>
            <span className="text-white/20">|</span>
            <span className="text-xs text-[#888888] font-mono-num">
              Comparing {comparedCars.length} of 3 Vehicles
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#999999] hover:text-white transition-colors cursor-pointer"
            aria-label="Close comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 w-40 text-[#777777] uppercase text-[11px] font-semibold">
                    Specification
                  </th>
                  {comparedCars.map(car => (
                    <th key={car.id} className="p-4 min-w-[220px]">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="text-lg font-luxury font-bold text-white">
                            {car.name}
                          </div>
                          <div className="text-[11px] text-[#C9A45C] font-medium">
                            {car.category}
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveCar(car.id)}
                          className="p-1 rounded bg-white/5 hover:bg-[#E66A6A]/20 text-[#888888] hover:text-[#E66A6A] transition-colors"
                          title="Remove car"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-base font-luxury font-bold text-white font-mono-num">
                        {formatPrice(car.dailyPrice)}
                        <span className="text-xs text-[#777777] font-normal"> / day</span>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => onBookCar(car)}
                          className="flex-1 py-2 px-3 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-[11px] uppercase rounded-lg transition-colors cursor-pointer text-center"
                        >
                          Book
                        </button>
                        <button
                          onClick={() => onView3D(car)}
                          className="py-2 px-3 bg-white/5 hover:bg-white/10 text-white text-[11px] rounded-lg transition-colors cursor-pointer"
                        >
                          3D
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-4 font-semibold text-[#888888]">Passenger Seats</td>
                  {comparedCars.map(car => (
                    <td key={car.id} className="p-4 font-mono-num text-white font-semibold">
                      {car.seats} Seats
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-[#888888]">Transmission</td>
                  {comparedCars.map(car => (
                    <td key={car.id} className="p-4 text-white">
                      {car.transmission}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-[#888888]">Powertrain / Fuel</td>
                  {comparedCars.map(car => (
                    <td key={car.id} className="p-4 text-white">
                      {car.fuel}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-[#888888]">Horsepower</td>
                  {comparedCars.map(car => (
                    <td key={car.id} className="p-4 font-mono-num text-[#C9A45C] font-bold">
                      {car.horsepower} HP
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-[#888888]">0–100 km/h</td>
                  {comparedCars.map(car => (
                    <td key={car.id} className="p-4 font-mono-num text-white">
                      {car.acceleration0To100} seconds
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-[#888888]">Top Speed</td>
                  {comparedCars.map(car => (
                    <td key={car.id} className="p-4 font-mono-num text-white">
                      {car.topSpeed} km/h
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-[#888888]">Drivetrain</td>
                  {comparedCars.map(car => (
                    <td key={car.id} className="p-4 text-white">
                      {car.drivetrain}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-[#888888]">Refundable Security Deposit</td>
                  {comparedCars.map(car => (
                    <td key={car.id} className="p-4 font-mono-num text-[#5ED39A] font-semibold">
                      {formatPrice(car.securityDeposit)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-semibold text-[#888888]">Ideal Occasion</td>
                  {comparedCars.map(car => (
                    <td key={car.id} className="p-4 text-[#AAAAAA] leading-relaxed text-[11px]">
                      {car.category === 'Sports' && 'High-speed coastal tours & weekend romantic escapes'}
                      {car.category === 'Performance' && 'Enthusiast mountain passes & pure track dynamics'}
                      {car.category === 'Luxury' && 'Grand touring, VIP escort & executive milestones'}
                      {car.category === 'Luxury SUV' && 'Family weekend estates & commanding road authority'}
                      {car.category === 'Comfort' && 'Effortless city transit & airport runs'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
