import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StockItem } from '../types';
import { Layers, ArrowRight } from 'lucide-react';

interface StockCardProps {
  stock: StockItem;
  isSelected: boolean;
  onSelectToggle: (symbol: string) => void;
}

export const StockCard: React.FC<StockCardProps> = ({ stock, isSelected, onSelectToggle }) => {
  const navigate = useNavigate();

  const handleAnalyse = () => {
    navigate(`/analysis/${stock.symbol}`);
  };

  return (
    <div className={`bg-[#151921] border ${isSelected ? 'border-blue-500 shadow-blue-500/10' : 'border-[#2A303C] hover:border-[#3A4252]'} rounded-xl p-5 flex flex-col justify-between transition-all shadow-lg`}>
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-gray-100 tracking-wide">{stock.symbol}</span>
              <span className="text-[10px] bg-[#0B0E14] text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono">
                {stock.sector}
              </span>
            </div>
            <h3 className="text-xs text-gray-400 truncate mt-0.5 max-w-[200px]">{stock.name}</h3>
          </div>

          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectToggle(stock.symbol)}
            className="w-4 h-4 rounded bg-[#0B0E14] border-[#2A303C] text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blue-600"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 bg-[#0B0E14] border border-[#2A303C] rounded-lg p-3 my-3">
          <div>
            <span className="block text-[10px] text-gray-400 uppercase tracking-wider">CMP</span>
            <span className="text-xs font-bold text-gray-100 font-mono">
              {stock.cmp !== null && stock.cmp !== undefined ? `₹${stock.cmp.toFixed(2)}` : 'Data unavailable'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Daily RSI</span>
            <span className="text-xs font-bold text-gray-100 font-mono">
              {stock.daily_rsi !== null && stock.daily_rsi !== undefined ? stock.daily_rsi.toFixed(1) : 'Data unavailable'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Weekly RSI</span>
            <span className="text-xs font-bold text-gray-100 font-mono">
              {stock.weekly_rsi !== null && stock.weekly_rsi !== undefined ? stock.weekly_rsi.toFixed(1) : 'Data unavailable'}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Current Status:</span>
            <span className="font-medium text-blue-400">{stock.status}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              <span>Confluence:</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              stock.confluence === '3/3' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              stock.confluence === '2/3' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              stock.confluence === '1/3' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              'bg-gray-800 text-gray-400 border border-gray-700'
            }`}>
              {stock.confluence}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleAnalyse}
        className="w-full bg-[#0B0E14] hover:bg-blue-600 border border-[#2A303C] hover:border-blue-500 text-gray-200 hover:text-white text-xs font-medium py-2 rounded-lg transition-all flex items-center justify-center space-x-2 group"
      >
        <span>Analyse Selected</span>
        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
};
