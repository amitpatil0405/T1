export interface StockItem {
  symbol: string;
  name: string;
  sector: string;
  weight: number;
  cmp: number | null;
  daily_rsi: number | null;
  weekly_rsi: number | null;
  status: string;
  confluence: string;
  events?: string[];
}

export interface User {
  user_id: string;
}

export interface DeepAnalysisData {
  symbol: string;
  cmp: number | null;
  weekly_rsi: number | null;
  daily_rsi: number | null;
  confluence_score: string;
  bollinger_bands: {
    upper: number | null;
    middle: number | null;
    lower: number | null;
    position: string;
  };
  rsi_divergence: {
    status: string;
    details: string;
  };
  candlestick_pattern: {
    pattern: string;
    type: string;
    is_reversal: boolean;
    date: string;
  };
  support_resistance: {
    supports: number[];
    resistances: number[];
  };
  option_strikes?: {
    atm: number | null;
    high_oi_call: number | null;
    high_oi_put: number | null;
  };
}
