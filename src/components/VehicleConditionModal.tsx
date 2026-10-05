import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Camera, Upload, ShieldCheck, Gauge, Fuel, FileSignature } from 'lucide-react';
import { VehicleCondition, Booking } from '../types';

interface VehicleConditionModalProps {
  booking: Booking;
  onClose: () => void;
  onSaveInspection: (condition: VehicleCondition) => void;
}

export const VehicleConditionModal: React.FC<VehicleConditionModalProps> = ({
  booking,
  onClose,
  onSaveInspection
}) => {
  const [condition, setCondition] = useState<VehicleCondition>({
    front: true,
    rear: true,
    leftSide: true,
    rightSide: true,
    interior: true,
    fuelPercent: 100,
    odometerKm: 12482,
    notes: 'No scratches observed. Factory clearcoat in pristine condition.',
    inspectorName: 'Velox Quality Inspector #44',
    customerSignature: 'Rahul K.'
  });

  const [simulatedPhotos, setSimulatedPhotos] = useState<string[]>([
    'Front_Bumper_Clean.jpg',
    'Right_Alloy_ZeroCurb.jpg',
    'Odometer_12482km.jpg'
  ]);

  const [saved, setSaved] = useState<boolean>(false);

  const handleToggle = (key: keyof Pick<VehicleCondition, 'front' | 'rear' | 'leftSide' | 'rightSide' | 'interior'>) => {
    setCondition(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddPhoto = () => {
    setSimulatedPhotos(prev => [...prev, `Inspection_Photo_${prev.length + 1}.jpg`]);
  };

  const handleSave = () => {
    onSaveInspection({
      ...condition,
      inspectedAt: new Date().toISOString(),
      inspectionPhotos: simulatedPhotos
    });
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0D0E12] border border-[#2B2D35] rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#090A0C]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#C9A45C]" />
            <span className="text-xs uppercase tracking-widest text-[#C9A45C] font-semibold">
              DIGITAL HANDOVER INSPECTION
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#888888] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-left">
          <div>
            <h3 className="text-xl font-luxury text-white">
              {booking.vehicleName} Condition Certificate
            </h3>
            <p className="text-xs text-[#888888] mt-0.5">
              Verified 360° audit prior to key handover. Protects both client & fleet records.
            </p>
          </div>

          {/* Inspection Checks */}
          <div className="bg-[#121318] border border-white/5 rounded-2xl p-4 space-y-3">
            <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#C9A45C] block">
              PANEL & INTEGRITY STATUS
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'front', label: 'Front Fascia & Splitter' },
                { key: 'rear', label: 'Rear Bumper & Diffuser' },
                { key: 'leftSide', label: 'Left Side & Sills' },
                { key: 'rightSide', label: 'Right Side & Mirrors' },
                { key: 'interior', label: 'Interior Leather & Screen' }
              ].map(item => {
                const isPassed = condition[item.key as keyof VehicleCondition] as boolean;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleToggle(item.key as any)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isPassed
                        ? 'bg-[#5ED39A]/10 border-[#5ED39A]/30 text-white'
                        : 'bg-[#E66A6A]/10 border-[#E66A6A]/30 text-[#E66A6A]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs font-bold">{isPassed ? '✓ PASSED' : 'FLAGGED'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Telemetry: Fuel & Odometer */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-[#121318] border border-white/5 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#888888]">
                <Fuel className="w-3.5 h-3.5 text-[#C9A45C]" />
                <span>Fuel Gauge Level</span>
              </div>
              <div className="text-xl font-mono-num font-bold text-white">
                {condition.fuelPercent}% (Full Tank)
              </div>
              <div className="text-[10px] text-[#5ED39A]">Verified 98 Octane RON</div>
            </div>

            <div className="p-4 bg-[#121318] border border-white/5 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#888888]">
                <Gauge className="w-3.5 h-3.5 text-[#C9A45C]" />
                <span>Odometer Reading</span>
              </div>
              <div className="text-xl font-mono-num font-bold text-white">
                {condition.odometerKm.toLocaleString()} km
              </div>
              <div className="text-[10px] text-[#AAAAAA]">GPS Telemetry Verified</div>
            </div>
          </div>

          {/* Photo attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#CCCCCC]">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-[#C9A45C]">
                Verification Photographs ({simulatedPhotos.length})
              </span>
              <button
                type="button"
                onClick={handleAddPhoto}
                className="text-[11px] text-[#C9A45C] hover:underline flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Add Photo</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {simulatedPhotos.map((photo, i) => (
                <div key={i} className="px-3 py-1.5 bg-[#15161C] border border-white/10 rounded-lg text-xs font-mono-num text-[#AAAAAA] flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-[#5ED39A]" />
                  <span>{photo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#888888] mb-1">
              Inspection Remarks
            </label>
            <textarea
              value={condition.notes}
              onChange={e => setCondition({ ...condition, notes: e.target.value })}
              rows={2}
              className="w-full bg-[#15161C] border border-[#2B2D35] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#C9A45C]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#050505]" />
                <span>Certificate Stamped & Sealed ✓</span>
              </>
            ) : (
              <>
                <FileSignature className="w-4 h-4 text-[#050505]" />
                <span>Sign & Issue Digital Rental Certificate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
