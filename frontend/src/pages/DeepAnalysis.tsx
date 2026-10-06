import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { InteractiveChart } from '../components/InteractiveChart';
import {
  ArrowLeft,
  Activity,
  BarChart2,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const DeepAnalysis: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/analysis/${symbol}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Error fetching analysis", err);
      } finally {
        setLoading(false);
      }
    };
    if (symbol) fetchAnalysis();
  }, [symbol]);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 bg-[#151921] hover:bg-[#1E232E] border border-[#2A303C] rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold tracking-tight text-gray-100">{symbol}</h1>
                <span className="text-xs font-mono uppercase bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded">
                  Deep Technical Scan
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {data?.company_name || 'Institutional Confluence & Reversal Diagnostics'}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400 space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs tracking-wider uppercase">Evaluating Reversal Signals...</span>
          </div>
        ) : !data || data.status === 'unavailable' ? (
          <div className="bg-[#151921] border border-[#2A303C] rounded-xl p-12 text-center text-gray-400">
            <AlertTriangle className="w-10 h-10 mx-auto text-yellow-500 mb-3" />
            <h3 className="text-base font-semibold text-gray-200">Historical data unavailable</h3>
            <p className="text-xs text-gray-500 mt-1">
              Could not compute indicators for {symbol}. Fresh data backfill may be required.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#151921] border border-[#2A303C] rounded-xl p-5 shadow-lg">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Current Market Price</span>
                <div className="text-2xl font-extrabold text-gray-100 font-mono mt-2">
                  {data.cmp !== null ? `₹${data.cmp.toFixed(2)}` : 'Data unavailable'}
                </div>
                <span className="text-[11px] text-gray-500 mt-1 block">Live / Latest Daily Close</span>
              </div>

              <div className="bg-[#151921] border border-[#2A303C] rounded-xl p-5 shadow-lg">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Weekly RSI (14)</span>
                <div className="text-2xl font-extrabold text-gray-100 font-mono mt-2">
                  {data.weekly_rsi !== null ? data.weekly_rsi.toFixed(1) : 'Data unavailable'}
                </div>
                <span className="text-[11px] text-gray-500 mt-1 block">Standard Levels: Upper 60 / Lower 40</span>
              </div>

              <div className="bg-[#151921] border border-[#2A303C] rounded-xl p-5 shadow-lg">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Daily RSI (14)</span>
                <div className="text-2xl font-extrabold text-gray-100 font-mono mt-2">
                  {data.daily_rsi !== null ? data.daily_rsi.toFixed(1) : 'Data unavailable'}
                </div>
                <span className="text-[11px] text-gray-500 mt-1 block">Standard Levels: Upper 60 / Lower 40</span>
              </div>

              <div className="bg-[#151921] border border-[#2A303C] rounded-xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Reversal Confluence</span>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-3xl font-extrabold text-blue-400 font-mono">{data.confluence_score}</span>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      data.confluence_score === '3/3' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      data.confluence_score === '2/3' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      data.confluence_score === '1/3' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}>
                      {data.confluence_score === '3/3' ? 'High Probability' :
                       data.confluence_score === '2/3' ? 'Moderate Confluence' :
                       data.confluence_score === '1/3' ? 'Low Confluence' : 'No Confluence'}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-gray-500 mt-2 block">Strict 3-Condition Logic Engine</span>
              </div>
            </div>

            {symbol && <InteractiveChart symbol={symbol} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-[#151921] border border-[#2A303C] rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#2A303C] pb-3">
                  <div className="flex items-center space-x-2">
                    <BarChart2 className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-bold text-gray-200">Bollinger Bands (20, 2)</h3>
                  </div>
                  {data.bollinger_bands.is_reversal ? (
                    <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Reversal Active</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[11px] text-gray-400 bg-[#0B0E14] border border-[#2A303C] px-2 py-0.5 rounded">
                      <XCircle className="w-3 h-3 text-gray-500" />
                      <span>No Reversal</span>
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#2A303C]/40">
                    <span className="text-gray-400">Position Status:</span>
                    <span className="font-semibold text-gray-200">{data.bollinger_bands.position}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2A303C]/40">
                    <span className="text-gray-400">Upper Band:</span>
                    <span className="font-mono text-gray-300">₹{data.bollinger_bands.upper?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2A303C]/40">
                    <span className="text-gray-400">Middle Band (SMA):</span>
                    <span className="font-mono text-gray-300">₹{data.bollinger_bands.middle?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Lower Band:</span>
                    <span className="font-mono text-gray-300">₹{data.bollinger_bands.lower?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#151921] border border-[#2A303C] rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#2A303C] pb-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-bold text-gray-200">RSI Swing Divergence</h3>
                  </div>
                  {data.rsi_divergence.is_reversal ? (
                    <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Divergence Active</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[11px] text-gray-400 bg-[#0B0E14] border border-[#2A303C] px-2 py-0.5 rounded">
                      <XCircle className="w-3 h-3 text-gray-500" />
                      <span>Aligned</span>
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#2A303C]/40">
                    <span className="text-gray-400">Detected Condition:</span>
                    <span className={`font-semibold ${data.rsi_divergence.is_reversal ? 'text-blue-400' : 'text-gray-300'}`}>
                      {data.rsi_divergence.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] leading-relaxed bg-[#0B0E14] border border-[#2A303C] p-3 rounded-lg">
                    {data.rsi_divergence.details}
                  </p>
                </div>
              </div>

              <div className="bg-[#151921] border border-[#2A303C] rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#2A303C] pb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-bold text-gray-200">Candlestick Pattern</h3>
                  </div>
                  {data.candlestick_pattern.is_reversal ? (
                    <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Pattern Active</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[11px] text-gray-400 bg-[#0B0E14] border border-[#2A303C] px-2 py-0.5 rounded">
                      <XCircle className="w-3 h-3 text-gray-500" />
                      <span>Standard</span>
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#2A303C]/40">
                    <span className="text-gray-400">Detected Pattern:</span>
                    <span className="font-semibold text-gray-200">{data.candlestick_pattern.pattern}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2A303C]/40">
                    <span className="text-gray-400">Bias:</span>
                    <span className={`font-semibold ${
                      data.candlestick_pattern.type === 'Bullish' ? 'text-emerald-400' :
                      data.candlestick_pattern.type === 'Bearish' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {data.candlestick_pattern.type}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Candle Date:</span>
                    <span className="font-mono text-gray-300">{data.candlestick_pattern.date || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
