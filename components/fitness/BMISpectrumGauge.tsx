import React from 'react';
import { BMICalculationResult } from '../../utils/bmiUtils.ts';
import { Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface BMISpectrumGaugeProps {
  bmiResult: BMICalculationResult;
  studentName?: string;
}

export const BMISpectrumGauge: React.FC<BMISpectrumGaugeProps> = ({ bmiResult, studentName }) => {
  if (!bmiResult || bmiResult.bmi === 0) return null;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <Activity size={24} />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              CBSE Student BMI Level & Spectrum
            </h4>
            <p className="text-xs text-slate-500 font-bold">
              {studentName ? `Analysis for ${studentName}` : 'Body Mass Index Assessment'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${bmiResult.badgeBg}`}>
            {bmiResult.category}
          </span>
          <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {bmiResult.bmi} kg/m²
          </span>
        </div>
      </div>

      {/* Visual BMI Spectrum Gauge Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
          <span>BMI Spectrum Gauge</span>
          <span className="text-indigo-600 font-extrabold">{bmiResult.level}</span>
        </div>

        {/* Multi-color Spectrum Track */}
        <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200 p-0.5">
          {/* Underweight Zone (< 18.5) */}
          <div className="h-full bg-blue-300 w-[25%] relative group cursor-pointer" title="Underweight (< 18.5)">
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-blue-900 opacity-90">
              &lt; 18.5
            </span>
          </div>

          {/* Normal Zone (18.5 - 24.9) */}
          <div className="h-full bg-emerald-400 w-[30%] relative group cursor-pointer" title="Normal Healthy (18.5 - 24.9)">
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-emerald-950">
              18.5 - 24.9 (Normal)
            </span>
          </div>

          {/* Overweight Zone (25.0 - 29.9) */}
          <div className="h-full bg-amber-400 w-[20%] relative group cursor-pointer" title="Overweight (25.0 - 29.9)">
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-amber-950">
              25-29.9
            </span>
          </div>

          {/* Obese I Zone (30.0 - 34.9) */}
          <div className="h-full bg-orange-500 w-[15%] relative group cursor-pointer" title="Obese Class I (30.0 - 34.9)">
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">
              30-34.9
            </span>
          </div>

          {/* Obese II Zone (>= 35.0) */}
          <div className="h-full bg-red-600 w-[10%] relative group cursor-pointer" title="Obese Class II (>= 35.0)">
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white">
              ≥35
            </span>
          </div>

          {/* Pointer Marker */}
          <div 
            className="absolute top-0 bottom-0 w-2 bg-slate-900 border-2 border-white rounded-full shadow-lg transition-all duration-500 z-10 -translate-x-1/2"
            style={{ left: `${bmiResult.gaugePercent}%` }}
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
              ▲ {bmiResult.bmi}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[9px] font-black uppercase text-slate-500 pt-1">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-300"></span>
            <span>Underweight (&lt;18.5)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Normal (18.5–24.9)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Overweight (25–29.9)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>Obese I (30–34.9)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span>Obese II (≥35)</span>
          </div>
        </div>
      </div>

      {/* Details Box */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-start gap-3">
        {bmiResult.rating === 'Excellent' ? (
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
        )}
        <div>
          <h5 className="font-black text-slate-900 text-xs uppercase tracking-wide mb-1">
            {bmiResult.level}
          </h5>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {bmiResult.details}
          </p>
          {bmiResult.weightKg && bmiResult.heightCm && (
            <div className="mt-2 text-[10px] font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200 w-fit">
              Recorded Mass: {bmiResult.weightKg} kg &bull; Height: {bmiResult.heightCm} cm
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
