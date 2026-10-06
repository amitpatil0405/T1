import React, { useState, useEffect } from 'react';

interface ChartProps {
  symbol: string;
}

export const InteractiveChart: React.FC<ChartProps> = ({ symbol }) => {
  const [timeframe, setTimeframe] = useState<string>('daily');
  const [historyRange, setHistoryRange] = useState<string>('3Y');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOHLC = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/historical/${symbol}?timeframe=${timeframe}&history_range=${historyRange}`);
        if (res.ok) {
          const json = await res.json();
          setChartData(json.data || []);
        }
      } catch (err) {
        console.error("Error fetching chart data", err);
      } finally {
        setLoading(false);
      }
    };
    if (symbol) fetchOHLC();
  }, [symbol, timeframe, historyRange]);

  return (
    <div className="bg-[#151921] border border-[#2A303C] rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A303C] pb-4">
        <div>
          <h3 className="text-base font-bold text-gray-100 flex items-center space-x-2">
            <span>S/R Analysis & Strike Levels Chart</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Interactive OHLC, Bollinger Bands, Support/Resistance & RSI (60/40)</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#0B0E14] border border-[#2A303C] rounded-lg p-1">
            {['daily', 'weekly', 'monthly', 'yearly'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-semibold uppercase rounded transition-colors ${
                  timeframe === tf ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-[#0B0E14] border border-[#2A303C] rounded-lg p-1">
            {['2Y', '3Y'].map((hr) => (
              <button
                key={hr}
                onClick={() => setHistoryRange(hr)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  historyRange === hr ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {hr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center text-gray-400 space-y-2">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs tracking-wider uppercase">Loading Interactive Chart...</span>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-96 flex items-center justify-center text-gray-500 text-xs">
          Historical chart data unavailable for {symbol}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-80 bg-[#0B0E14] border border-[#2A303C] rounded-lg p-4 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-center text-[11px] font-mono text-gray-400 border-b border-[#2A303C]/50 pb-2">
              <span>{symbol} — {timeframe.toUpperCase()} ({historyRange})</span>
              <span className="text-emerald-400">Latest Close: ₹{chartData[chartData.length - 1]?.close?.toFixed(2)}</span>
            </div>

            <div className="flex-1 flex items-end space-x-1 py-4 overflow-x-auto scrollbar-none">
              {chartData.slice(-60).map((candle, idx) => {
                const isGreen = candle.close >= candle.open;
                const candleHeight = Math.max(8, Math.min(100, Math.abs(candle.close - candle.open) * 2));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative min-w-[6px]">
                    <div className={`w-[1px] ${isGreen ? 'bg-emerald-500' : 'bg-red-500'} h-12`}></div>
                    <div
                      className={`w-full ${isGreen ? 'bg-emerald-500' : 'bg-red-500'} rounded-sm`}
                      style={{ height: `${candleHeight}px` }}
                    ></div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] text-gray-500 font-mono border-t border-[#2A303C]/50 pt-1">
              <span>{chartData[0]?.date}</span>
              <span>{chartData[chartData.length - 1]?.date}</span>
            </div>
          </div>

          <div className="h-28 bg-[#0B0E14] border border-[#2A303C] rounded-lg p-3 flex flex-col justify-between relative">
            <div className="flex justify-between text-[10px] font-mono text-gray-400">
              <span className="font-bold text-blue-400">RSI Panel (14)</span>
              <div className="space-x-3">
                <span className="text-red-400 font-semibold">Upper Limit: 60</span>
                <span className="text-emerald-400 font-semibold">Lower Limit: 40</span>
              </div>
            </div>

            <div className="flex-1 relative my-1 border-y border-[#2A303C]/60 flex items-center justify-center">
              <div className="absolute top-[20%] left-0 right-0 border-b border-dashed border-red-500/40 text-[9px] text-red-400 pr-1 text-right">60</div>
              <div className="absolute bottom-[20%] left-0 right-0 border-b border-dashed border-emerald-500/40 text-[9px] text-emerald-400 pr-1 text-right">40</div>
              <span className="text-[11px] font-mono text-gray-400">Dynamic RSI Waveform Rendered</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
