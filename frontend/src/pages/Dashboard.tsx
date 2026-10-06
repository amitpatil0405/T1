import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { FilterBar, FilterState } from '../components/FilterBar';
import { StockCard } from '../components/StockCard';
import { StockItem } from '../types';
import { RefreshCw, SlidersHorizontal } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    statuses: [],
    events: [],
    signals: [],
    sectors: [],
  });

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      filters.statuses.forEach((s) => params.append('status_filter', s));
      filters.sectors.forEach((s) => params.append('sector_filter', s));
      filters.events.forEach((e) => params.append('events_filter', e));

      const res = await fetch(`/api/v1/stocks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStocks(data);
      }
    } catch (err) {
      console.error("Error fetching stocks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [filters]);

  const handleToggleSelect = (symbol: string) => {
    setSelectedSymbols((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-100">Market Overview & Scan</h2>
            <p className="text-xs text-gray-400 mt-0.5">Real-time trading signal scanner & strategy confluence analysis</p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-400 font-mono">
              Selected: <strong className="text-blue-400">{selectedSymbols.length}</strong>
            </span>
            <button
              onClick={fetchStocks}
              className="p-2 bg-[#151921] hover:bg-[#1E232E] border border-[#2A303C] rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          </div>
        </div>

        <FilterBar filters={filters} onChange={setFilters} />

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs tracking-wider uppercase">Loading Stock Universe...</span>
          </div>
        ) : stocks.length === 0 ? (
          <div className="bg-[#151921] border border-[#2A303C] rounded-xl p-12 text-center text-gray-400">
            <SlidersHorizontal className="w-10 h-10 mx-auto text-gray-600 mb-3" />
            <h3 className="text-base font-semibold text-gray-200">No stocks matched your filters</h3>
            <p className="text-xs text-gray-500 mt-1">Try resetting or broadening your status, sector, or search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {stocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                isSelected={selectedSymbols.includes(stock.symbol)}
                onSelectToggle={handleToggleSelect}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
