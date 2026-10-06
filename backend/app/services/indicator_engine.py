import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple

def calculate_rsi(prices: pd.Series, period: int = 14) -> pd.Series:
    delta = prices.diff()
    gain = delta.clip(lower=0)
    loss = -1 * delta.clip(upper=0)
    avg_gain = gain.ewm(com=period - 1, min_periods=period).mean()
    avg_loss = loss.ewm(com=period - 1, min_periods=period).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_bollinger_bands(prices: pd.Series, period: int = 20, num_std: float = 2.0) -> Tuple[pd.Series, pd.Series, pd.Series]:
    sma = prices.rolling(window=period).mean()
    std = prices.rolling(window=period).std()
    upper = sma + (std * num_std)
    lower = sma - (std * num_std)
    return upper, sma, lower

def classify_bollinger_position(current_price: float, upper: float, middle: float, lower: float) -> Tuple[str, bool]:
    bandwidth = upper - lower
    if bandwidth <= 0:
        return "Inside Bands", False
    if current_price > upper:
        return "Above Upper Band", True
    elif current_price >= upper - (0.1 * bandwidth):
        return "Near Upper Band", True
    elif current_price < lower:
        return "Below Lower Band", True
    elif current_price <= lower + (0.1 * bandwidth):
        return "Near Lower Band", True
    else:
        return "Inside Bands", False

def detect_rsi_divergence(prices: pd.Series, rsi: pd.Series, lookback: int = 30) -> Tuple[str, str, bool]:
    if len(prices) < lookback or len(rsi) < lookback:
        return "No divergence detected", "Insufficient historical data for swing pivot analysis", False
    recent_prices = prices.tail(lookback).values
    recent_rsi = rsi.tail(lookback).values
    min_indices = []
    for i in range(2, len(recent_prices) - 2):
        if recent_prices[i] < recent_prices[i-1] and recent_prices[i] < recent_prices[i-2] and \
           recent_prices[i] < recent_prices[i+1] and recent_prices[i] < recent_prices[i+2]:
            min_indices.append(i)
    max_indices = []
    for i in range(2, len(recent_prices) - 2):
        if recent_prices[i] > recent_prices[i-1] and recent_prices[i] > recent_prices[i-2] and \
           recent_prices[i] > recent_prices[i+1] and recent_prices[i] > recent_prices[i+2]:
            max_indices.append(i)
    if len(min_indices) >= 2:
        prev_idx, curr_idx = min_indices[-2], min_indices[-1]
        price_ll = recent_prices[curr_idx] < recent_prices[prev_idx]
        rsi_hl = recent_rsi[curr_idx] > recent_rsi[prev_idx]
        if price_ll and rsi_hl:
            return "Bullish Divergence", f"Price made Lower Low ({recent_prices[curr_idx]:.2f} < {recent_prices[prev_idx]:.2f}) while RSI made Higher Low ({recent_rsi[curr_idx]:.1f} > {recent_rsi[prev_idx]:.1f})", True
    if len(max_indices) >= 2:
        prev_idx, curr_idx = max_indices[-2], max_indices[-1]
        price_hh = recent_prices[curr_idx] > recent_prices[prev_idx]
        rsi_lh = recent_rsi[curr_idx] < recent_rsi[prev_idx]
        if price_hh and rsi_lh:
            return "Bearish Divergence", f"Price made Higher High ({recent_prices[curr_idx]:.2f} > {recent_prices[prev_idx]:.2f}) while RSI made Lower High ({recent_rsi[curr_idx]:.1f} < {recent_rsi[prev_idx]:.1f})", True
    return "No divergence detected", "Price and RSI swings are aligned", False

def detect_candlestick_patterns(df: pd.DataFrame) -> Tuple[str, str, bool, str]:
    if len(df) < 3:
        return "No pattern", "Neutral", False, ""
    c0 = df.iloc[-1]
    c1 = df.iloc[-2]
    date_str = str(c0["date"]) if "date" in c0 else ""
    o0, h0, l0, cl0 = c0["open"], c0["high"], c0["low"], c0["close"]
    o1, h1, l1, cl1 = c1["open"], c1["high"], c1["low"], c1["close"]
    body0 = abs(cl0 - o0)
    range0 = h0 - l0 if (h0 - l0) > 0 else 1.0
    if (cl1 < o1) and (cl0 > o0) and (cl0 >= o1) and (o0 <= cl1):
        return "Bullish Engulfing", "Bullish", True, date_str
    if (cl1 > o1) and (cl0 < o0) and (cl0 <= o1) and (o0 >= cl1):
        return "Bearish Engulfing", "Bearish", True, date_str
    lower_wick0 = min(o0, cl0) - l0
    upper_wick0 = h0 - max(o0, cl0)
    if body0 / range0 <= 0.1:
        return "Doji", "Neutral", True, date_str
    if lower_wick0 >= 2 * body0 and upper_wick0 <= 0.2 * range0:
        return "Hammer", "Bullish", True, date_str
    if upper_wick0 >= 2 * body0 and lower_wick0 <= 0.2 * range0:
        if cl0 < o0:
            return "Shooting Star", "Bearish", True, date_str
        return "Inverted Hammer", "Bullish", True, date_str
    return "Standard Candle", "Neutral", False, date_str

def calculate_support_resistance(prices: pd.Series, num_levels: int = 3) -> Dict[str, List[float]]:
    if len(prices) < 10:
        return {"supports": [], "resistances": []}
    highs = prices.rolling(window=5, center=True).max()
    lows = prices.rolling(window=5, center=True).min()
    res_levels = sorted(list(set(highs.dropna().values)), reverse=True)[:num_levels]
    sup_levels = sorted(list(set(lows.dropna().values)))[:num_levels]
    return {
        "supports": [round(float(s), 2) for s in sup_levels],
        "resistances": [round(float(r), 2) for r in res_levels]
    }

def calculate_reversal_confluence(bb_reversal: bool, rsi_divergence_reversal: bool, candlestick_reversal: bool) -> str:
    score = sum([1 for cond in [bb_reversal, rsi_divergence_reversal, candlestick_reversal] if cond])
    return f"{score}/3"
