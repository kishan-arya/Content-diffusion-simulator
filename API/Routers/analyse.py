import subprocess
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query
from .. import db
from Analyser import analyze, SimError

REPO_DIR = Path(__file__).resolve().parent.parent.parent
SIM_DIR = REPO_DIR / "Simulator"
EXE = SIM_DIR / "simulator.exe"
DATA_DIR = REPO_DIR / "data"

router = APIRouter(
    prefix="/analyse",
    tags=["Layer 5 - Analyser"],
)


@router.post("")
def analyse(
    content_id: str = Query(..., min_length=1, description="content_id from /context/analyze"),
    user_id: str = Query(..., min_length=1, description="creator user_id from /creator/analyze"),
    runs: int = Query(5000, ge=100, le=20000, description="baseline Monte Carlo runs"),
    scenario_runs: int = Query(1000, ge=200, le=8000, description="runs per counterfactual"),
    seed: int = Query(42, description="fixed seed"),
):
    if not EXE.exists():
        raise HTTPException(status_code=503, detail="simulator.exe not built — run Simulator/build.bat")

    rec = db.get_content_file(content_id)
    content_arg = rec["path"] if rec and Path(rec["path"]).exists() else content_id

    crec = db.get_latest_creator_file(user_id)
    creator_arg = crec["path"] if crec and Path(crec["path"]).exists() else user_id

    try:
        return analyze(content_arg, creator_arg, data_dir=DATA_DIR, sim_dir=SIM_DIR, exe=EXE, runs=runs, scenario_runs=scenario_runs, seed=seed)
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="simulation timed out")
    except SimError as e:
        detail = str(e)
        raise HTTPException(status_code=404 if "not found" in detail else 500, detail=detail)
