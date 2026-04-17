"""AI pipeline that structures the messy shipping manifests."""

import re
import logging

log = logging.getLogger(__name__)


class LogisticsExtractor:
    """Extracts structured cargo data from messy manifest payloads."""

    def extract(self, raw: dict) -> dict:
        items = []

        # If raw_text is present, parse the text format
        if raw.get("raw_text"):
            items = self._parse_text(raw["raw_text"])
        elif raw.get("cargo"):
            items = self._normalize_cargo(raw["cargo"])

        total_mass = sum(i.get("mass_kg") or 0 for i in items)

        return {
            "manifest_id": raw.get("manifest_id", "unknown"),
            "vehicle": raw.get("vehicle", "unknown"),
            "origin": raw.get("origin", "unknown"),
            "total_mass_kg": round(total_mass, 2),
            "item_count": len(items),
            "items": items,
        }

    def _normalize_cargo(self, cargo: list[dict]) -> list[dict]:
        normalized = []
        for entry in cargo:
            normalized.append({
                "item": entry.get("item", "Unknown Item"),
                "quantity": int(entry.get("qty", entry.get("quantity", 1))),
                "mass_kg": entry.get("mass_kg"),
                "priority": entry.get("priority", "medium"),
                "notes": (entry.get("notes") or "").strip(),
            })
        return normalized

    def _parse_text(self, text: str) -> list[dict]:
        items = []
        for line in text.split("\n"):
            line = line.strip()
            match = re.match(r"-\s*(\d+)x\s+(.+?)(?:\s+\((\d+\.?\d*)kg\))?$", line)
            if match:
                qty = int(match.group(1))
                name = match.group(2).strip()
                mass = float(match.group(3)) if match.group(3) else None
                items.append({
                    "item": name,
                    "quantity": qty,
                    "mass_kg": mass,
                    "priority": "medium",
                    "notes": "",
                })
        return items
