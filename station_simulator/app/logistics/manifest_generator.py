"""Generates messy, unstructured JSON/text cargo manifests."""

import json
import random
import time
import uuid


_ITEMS = [
    "Water Recycler Filter Pack", "Lithium Battery Module 12V",
    "EVA Suit Helmet Visor", "Food Ration Packet (Beef Stew)",
    "Oxygen Canister 5L", "Medical Kit Type-A", "Thermal Blanket",
    "Solar Panel Repair Kit", "Radiation Dosimeter", "CO2 Scrubber Cartridge",
    "Laptop (Ruggedized)", "Science Sample Container", "Emergency Beacon",
    "Water (Potable) 10L", "Tool Kit – Torque Wrench Set",
]

_ORIGINS = ["KSC", "Baikonur", "Tanegashima", "Kourou", "VAFB"]
_VEHICLES = ["Cygnus NG-22", "Dragon XL-4", "HTV-X3", "ATV Jules Verne II"]


def generate_manifest() -> dict:
    """Return a deliberately messy cargo manifest."""
    num_items = random.randint(3, 8)
    items = []
    for _ in range(num_items):
        item_name = random.choice(_ITEMS)
        qty = random.randint(1, 20)
        mass_kg = round(random.uniform(0.2, 45.0), 2)
        # Randomly omit fields to make it messy
        entry: dict = {"item": item_name, "qty": qty}
        if random.random() > 0.3:
            entry["mass_kg"] = mass_kg
        if random.random() > 0.5:
            entry["priority"] = random.choice(["critical", "high", "medium", "low"])
        if random.random() > 0.6:
            entry["notes"] = random.choice([
                "Handle with care", "FRAGILE", "Keep at -20C",
                "Stow port side rack 3", "n/a", "",
            ])
        items.append(entry)

    manifest = {
        "manifest_id": str(uuid.uuid4())[:8],
        "vehicle": random.choice(_VEHICLES),
        "origin": random.choice(_ORIGINS),
        "launch_ts": time.time() + random.randint(86400, 604800),
        "cargo": items,
    }

    # Sometimes return a raw text blob instead of clean JSON
    if random.random() > 0.6:
        lines = [f"MANIFEST {manifest['manifest_id']} // {manifest['vehicle']}"]
        for itm in items:
            line = f"  - {itm['qty']}x {itm['item']}"
            if "mass_kg" in itm:
                line += f" ({itm['mass_kg']}kg)"
            lines.append(line)
        manifest["raw_text"] = "\n".join(lines)

    return manifest
