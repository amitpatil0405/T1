import requests
import logging
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class DhanService:
    def __init__(self):
        self.client_id = settings.DHAN_CLIENT_ID
        self.access_token = settings.DHAN_ACCESS_TOKEN
        self.base_url = "https://api.dhan.co/v2"

    def is_configured(self) -> bool:
        return bool(self.client_id and self.access_token)

    def get_headers(self) -> Dict[str, str]:
        return {
            "access-token": self.access_token,
            "client-id": self.client_id,
            "Content-Type": "application/json"
        }

    def fetch_live_quote(self, symbol: str) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "status": "unavailable",
                "message": "Dhan credentials not configured",
                "cmp": None
            }
        try:
            response = requests.get(
                f"{self.base_url}/marketfeed/quote",
                headers=self.get_headers(),
                params={"symbol": symbol},
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                cmp_val = data.get("data", {}).get("last_price")
                return {"status": "success", "symbol": symbol, "cmp": cmp_val}
            else:
                return {"status": "unavailable", "message": "Data unavailable", "cmp": None}
        except Exception as e:
            logger.error(f"Failed to fetch Dhan quote for {symbol}: {e}")
            return {"status": "unavailable", "message": "Data unavailable", "cmp": None}

    def fetch_option_chain(self, symbol: str) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "status": "unavailable",
                "message": "Option strike data unavailable",
                "strikes": []
            }
        try:
            response = requests.post(
                f"{self.base_url}/optionchain",
                headers=self.get_headers(),
                json={"UnderlyingSymbol": symbol},
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                return {"status": "success", "symbol": symbol, "data": data.get("data", [])}
            else:
                return {"status": "unavailable", "message": "Option strike data unavailable", "strikes": []}
        except Exception as e:
            logger.error(f"Failed to fetch Dhan option chain for {symbol}: {e}")
            return {"status": "unavailable", "message": "Option strike data unavailable", "strikes": []}
