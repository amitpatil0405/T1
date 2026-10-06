import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export interface FilterState {
  search: string;
  statuses: string[];
  events: string[];
  signals: string[];
  sectors: string[];
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const STATUS_OPTIONS = [
  "Bear Call spread (Bearish)",
  "Bull Put spread (Bullish)",
  "Iron condor / Short strangle (Sideways)",
  "Waiting for confirmation",
];

const EVENT_OPTIONS = [
  "Quarter Results",
  "Dividend",
  "Buyback",
  "Board Meeting",
];

const SIGNAL_OPTIONS = [
  "RSI < 40",
  "RSI 40 - 60",
  "RSI > 60",
];

const SECTOR_OPTIONS = [
  "Banking & Financial Services",
  "FMCG",
  "Information Technology",
  "Healthcare & Pharmaceuticals",
  "Power, Energy & Infrastructure",
];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
  const toggleItem = (category: keyof FilterState, value: string) => {
    if (category === 'search') return;
    const current = filters[category] as string[];
    const updated = current.includes(value)
      ? current.filter((i) => i !== value)
      : [...current, value];
    onChange({ ...filters, [category]: updated });
  };

  const resetFilters = () => {
    onChange({
      search: '',
      statuses: [],
      events: [],
      signals: [],
      sectors: [],
    });
  };

  return (
    <div className="bg-[#151921] border border-[#2A303C] rounded-xl p-5 mb-6 space-y-4 shadow-lg">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search stock symbol, company name or index..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full bg-[#0B0E14] border border-[#2A303C] rounded-lg py-2 pl-10 pr-4 text-xs text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <button
          onClick={resetFilters}
          className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-[#0B0E14] hover:bg-[#1E232E] border border-[#2A303C] rounded-lg text-xs font-medium text-gray-300 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#2A303C]/60">
        <div>
          <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Stocks Status
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((opt) => {
              const active = filters.statuses.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleItem('statuses', opt)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white border border-blue-500'
                      : 'bg-[#0B0E14] text-gray-400 hover:text-gray-200 border border-[#2A303C]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Events
          </span>
          <div className="flex flex-wrap gap-1.5">
            {EVENT_OPTIONS.map((opt) => {
              const active = filters.events.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleItem('events', opt)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white border border-blue-500'
                      : 'bg-[#0B0E14] text-gray-400 hover:text-gray-200 border border-[#2A303C]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            RSI Signals
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SIGNAL_OPTIONS.map((opt) => {
              const active = filters.signals.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleItem('signals', opt)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white border border-blue-500'
                      : 'bg-[#0B0E14] text-gray-400 hover:text-gray-200 border border-[#2A303C]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Sector
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SECTOR_OPTIONS.map((opt) => {
              const active = filters.sectors.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleItem('sectors', opt)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white border border-blue-500'
                      : 'bg-[#0B0E14] text-gray-400 hover:text-gray-200 border border-[#2A303C]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
