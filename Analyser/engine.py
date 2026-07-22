from __future__ import annotations
import json
import logging
import os
import subprocess
import tempfile
from pathlib import Path

from . import copywriter
from . import levers as lever_policy

logger = logging.getLogger(__name__)

# The 7 fields the frontend's SimOutput contract needs.
_OUTPUT_FIELDS = ("expected_reach", "reach_p10", "reach_p50", "reach_p90","viral_probability", "confidence", "mean_wave")

class SimError(RuntimeError):
    """The simulator exited non-zero; message is its last stderr line."""

def _read_json(path: str | os.PathLike | None) -> dict:
    if not path:
        return {}
    p = Path(path)
    if not p.is_file():
        return {}
    try:
        with p.open(encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return {}

# Execute the command for runing the simulator.exe for scenarios
def _run_scenarios(exe: Path, sim_dir: Path, *, content_arg: str, creator_arg: str | None, data_dir: Path, runs: int, seed: int, spec_path: Path, timeout: int) -> dict:
    cmd = [str(exe), "--content", content_arg]
    if creator_arg:
        cmd += ["--creator", creator_arg]
    cmd += ["--data", str(data_dir), "--runs", str(runs),
            "--seed", str(seed), "--scenarios", str(spec_path)]
    proc = subprocess.run(cmd, capture_output=True, text=True, cwd=str(sim_dir), timeout=timeout)
    if proc.returncode != 0:
        lines = (proc.stderr or "").strip().splitlines()
        raise SimError(lines[-1] if lines else "simulator failed")
    return json.loads(proc.stdout)

# L5 final function 
def analyze(content_arg: str, creator_arg: str | None, *, data_dir: str | os.PathLike,
            sim_dir: str | os.PathLike, exe: str | os.PathLike,
            runs: int = 5000, seed: int = 42, scenario_runs: int = 1000,
            timeout: int = 120) -> dict:
    data_dir = Path(data_dir)
    sim_dir = Path(sim_dir)
    exe = Path(exe)

    base_content = _read_json(content_arg if Path(str(content_arg)).is_file() else None)
    trend = _read_json(data_dir / "trends" / "trend_snapshot.json")

    scenarios, meta = lever_policy.build_scenarios(base_content, trend)
    spec = {"runs": scenario_runs, "scenarios": scenarios}

    fd, spec_name = tempfile.mkstemp(prefix="reech_scen_", suffix=".json")
    spec_path = Path(spec_name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(spec, f)
        raw = _run_scenarios(exe, sim_dir, content_arg=content_arg, creator_arg=creator_arg,
                             data_dir=data_dir, runs=runs, seed=seed,
                             spec_path=spec_path, timeout=timeout)
    finally:
        spec_path.unlink(missing_ok=True)

    output = {k: raw[k] for k in _OUTPUT_FIELDS if k in raw}
    levers = lever_policy.rank_and_select(raw.get("scenarios", []), base_content, meta)
    report = copywriter.write_report(levers, output)

    logger.info("Analyse: %d levers tested, %d suggestions (top lift %.1f%%)",len(raw.get("scenarios", [])) - 1, len(report["suggestions"]),levers[0]["delta_reach_pct"] if levers else 0.0)

    result = {
        "output": output,
        "verdict": report["verdict"],
        "suggestions": report["suggestions"],
        "content_id": raw.get("content_id"),
        "audience_pool": raw.get("audience_pool"),
        "trend_alignment": raw.get("trend_alignment"),
        "engagement": raw.get("engagement")
    }
    return result
