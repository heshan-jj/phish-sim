#!/usr/bin/env python3
"""Build agent zip with both AgentCard.json and Agentcard.json (case-sensitive names)."""

from __future__ import annotations

import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AGENT_DIR = ROOT / "agents" / "a2a-phish-sim-content"
OUT_ZIP = ROOT / "agents" / "a2a-phish-sim-content.zip"
CARD = AGENT_DIR / "AgentCard.json"


def main() -> None:
    card_bytes = CARD.read_bytes()
    skip = {OUT_ZIP.name}

    with zipfile.ZipFile(OUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(AGENT_DIR.rglob("*")):
            if not path.is_file():
                continue
            if path.name in skip:
                continue
            arc = path.relative_to(AGENT_DIR).as_posix()
            zf.write(path, arc)

        # Nasiko deploy expects this exact filename (Windows cannot store both on disk).
        if "Agentcard.json" not in zf.namelist():
            zf.writestr("Agentcard.json", card_bytes)

    print(f"Wrote {OUT_ZIP}")


if __name__ == "__main__":
    main()
