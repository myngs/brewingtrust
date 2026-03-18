from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

import pandas as pd

try:
    from sklearn.ensemble import IsolationForest
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "scikit-learn is required. Install it with: pip install scikit-learn pandas"
    ) from exc


def _script_dirs() -> tuple[Path, Path]:
    """
    Returns (main_code_dir, ai_dir).

    This script is intended to live in: <Main Code>/AI/anomaly_detection.py
    but it also works when executed from other directories.
    """
    script_path = Path(__file__).resolve()
    ai_dir = script_path.parent
    main_code_dir = ai_dir.parent

    # If someone ran this from a copied location, fallback to CWD layout.
    if main_code_dir.name.lower() != "main code" and Path.cwd().name.lower() == "main code":
        main_code_dir = Path.cwd().resolve()
        ai_dir = main_code_dir / "AI"

    ai_dir.mkdir(parents=True, exist_ok=True)
    return main_code_dir, ai_dir


def _parse_time(value: Any) -> datetime | None:
    if value is None or value == "":
        return None

    # Off-chain storage uses Unix seconds.
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(float(value), tz=timezone.utc).astimezone()

    if isinstance(value, str):
        s = value.strip()
        if s.isdigit():
            return datetime.fromtimestamp(float(s), tz=timezone.utc).astimezone()

        # Accept ISO strings like "2026-03-14T08:05:00" and "2026-03-14 08:05:00"
        try:
            dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        except ValueError:
            return None
        if dt.tzinfo is None:
            local_tz = datetime.now().astimezone().tzinfo
            dt = dt.replace(tzinfo=local_tz)
        return dt.astimezone()

    return None


def _iter_offchain_json_files(main_code_dir: Path) -> Iterable[Path]:
    data_dir = main_code_dir / "server" / "data"
    if not data_dir.exists():
        return []

    # Prefer the "attendance_all.json" file if present, but also read monthly shards.
    candidates: list[Path] = []
    all_file = data_dir / "attendance_all.json"
    if all_file.exists():
        candidates.append(all_file)
    candidates.extend(sorted(data_dir.rglob("attendance_*.json")))
    return candidates


def query_blockchain_attendance_logs(
    main_code_dir: Path,
    source: str,
    input_path: Path | None = None,
) -> list[dict[str, Any]]:
    """
    Produces logs with the required schema:
      [employee_id, clock_in_time, clock_out_time]

    Notes for this codebase:
    - The blockchain stores only hashes, while actual clock times are stored off-chain
      in JSON files under server/data (see server/utils/offChainStorage.js).
    - This function reads those off-chain JSON records as the "attendance logs" source.
    """
    if source == "sample":
        return [
            {
                "employee_id": "E123",
                "clock_in_time": "2026-03-14T08:05:00",
                "clock_out_time": "2026-03-14T17:00:00",
            },
            {
                "employee_id": "E124",
                "clock_in_time": "2026-03-14T03:00:00",
                "clock_out_time": "2026-03-14T12:00:00",  # unusual
            },
            {
                "employee_id": "E125",
                "clock_in_time": "2026-03-14T09:00:00",
                "clock_out_time": "2026-03-14T18:00:00",
            },
        ]

    if source in {"csv", "json"}:
        if input_path is None:
            raise ValueError("--input-path is required for source=csv/json")
        if not input_path.exists():
            raise FileNotFoundError(str(input_path))

        if source == "csv":
            df = pd.read_csv(input_path)
            rows = df.to_dict(orient="records")
        else:
            rows = json.loads(input_path.read_text(encoding="utf-8"))
            if isinstance(rows, dict) and "attendance_logs" in rows:
                rows = rows["attendance_logs"]
            if not isinstance(rows, list):
                raise ValueError("JSON input must be a list (or {attendance_logs: [...]})")

        normalized: list[dict[str, Any]] = []
        for row in rows:
            normalized.append(
                {
                    "employee_id": row.get("employee_id") or row.get("employeeId"),
                    "clock_in_time": row.get("clock_in_time")
                    or row.get("clockIn")
                    or row.get("clock_in"),
                    "clock_out_time": row.get("clock_out_time")
                    or row.get("clockOut")
                    or row.get("clock_out"),
                }
            )
        return normalized

    if source == "offchain":
        logs: list[dict[str, Any]] = []
        for file_path in _iter_offchain_json_files(main_code_dir):
            try:
                records = json.loads(file_path.read_text(encoding="utf-8"))
            except Exception:
                continue
            if not isinstance(records, list):
                continue
            for r in records:
                if not isinstance(r, dict):
                    continue
                logs.append(
                    {
                        "employee_id": r.get("employeeId") or r.get("employee_id"),
                        "clock_in_time": r.get("clockIn") or r.get("clock_in_time"),
                        "clock_out_time": r.get("clockOut") or r.get("clock_out_time"),
                    }
                )
        if logs:
            return logs

        # Fallback if no off-chain data exists yet.
        return query_blockchain_attendance_logs(main_code_dir, source="sample")

    raise ValueError(f"Unknown source: {source}")


def extract_features(attendance_logs: list[dict[str, Any]]) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for log in attendance_logs:
        employee_id = log.get("employee_id")
        clock_in = _parse_time(log.get("clock_in_time"))
        clock_out = _parse_time(log.get("clock_out_time"))

        if not employee_id or clock_in is None or clock_out is None:
            continue

        shift_length = (clock_out - clock_in).total_seconds() / 3600.0
        
        # Additional features for better anomaly detection
        clock_in_hour = int(clock_in.hour)
        clock_out_hour = int(clock_out.hour)
        day_of_week = clock_in.weekday()  # 0=Monday, 6=Sunday
        
        # Detect if shift crosses midnight
        crosses_midnight = 1 if clock_out_hour < clock_in_hour else 0
        
        # Calculate deviation from standard 8-hour shift
        shift_deviation = abs(shift_length - 8.0)
        
        rows.append(
            {
                "employee_id": str(employee_id),
                "clock_in_time": clock_in.isoformat(),
                "clock_out_time": clock_out.isoformat(),
                "clock_in_hour": clock_in_hour,
                "clock_out_hour": clock_out_hour,
                "shift_length": float(shift_length),
                "day_of_week": day_of_week,
                "crosses_midnight": crosses_midnight,
                "shift_deviation": shift_deviation,
            }
        )

    return pd.DataFrame(rows)


def run_anomaly_detection(
    df: pd.DataFrame,
    contamination: float,
    random_state: int,
) -> pd.DataFrame:
    if df.empty:
        raise ValueError("No usable attendance rows found (missing clock-in/clock-out?).")

    # Use enhanced feature set for better anomaly detection
    # Includes: clock-in hour, clock-out hour, shift length, day of week, midnight crossing, and shift deviation
    X = df[["clock_in_hour", "clock_out_hour", "shift_length", "day_of_week", "crosses_midnight", "shift_deviation"]]
    
    model = IsolationForest(
        contamination=contamination,
        random_state=random_state,
        n_estimators=200,
        max_samples="auto",
        max_features=1.0,
    )
    model.fit(X)
    df["anomaly_flag"] = model.predict(X)
    
    # Add anomaly score for additional context
    df["anomaly_score"] = model.score_samples(X)
    
    return df


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Isolation Forest anomaly detection for blockchain-based cafe attendance logs."
    )
    parser.add_argument(
        "--source",
        choices=["offchain", "sample", "csv", "json"],
        default="offchain",
        help="Where to read attendance logs from. Default: offchain (server/data/*.json).",
    )
    parser.add_argument(
        "--input-path",
        type=Path,
        default=None,
        help="Path to CSV/JSON logs when --source is csv/json.",
    )
    parser.add_argument(
        "--contamination",
        type=float,
        default=0.05,
        help="Expected anomaly fraction (0 < c < 0.5). Default: 0.05.",
    )
    parser.add_argument(
        "--random-state",
        type=int,
        default=42,
        help="Random seed for reproducibility. Default: 42.",
    )
    args = parser.parse_args()

    main_code_dir, ai_dir = _script_dirs()

    attendance_logs = query_blockchain_attendance_logs(
        main_code_dir=main_code_dir,
        source=args.source,
        input_path=args.input_path,
    )

    df = extract_features(attendance_logs)
    df = run_anomaly_detection(df, contamination=args.contamination, random_state=args.random_state)

    output_file = ai_dir / "anomaly_results.csv"
    df.to_csv(output_file, index=False)

    print(f"Saved anomaly results to: {output_file}")
    print("Attendance anomaly detection results (preview):")
    print(df.head(25).to_string(index=False))

    anomalies = df[df["anomaly_flag"] == -1]
    if anomalies.empty:
        print("\nNo anomalies flagged.")
        return 0

    print("\nFlagged anomalies for admin review:")
    for _, row in anomalies.iterrows():
        print(
            "ALERT: Employee {employee_id} flagged as anomaly "
            "(clock-in {clock_in_hour}h, clock-out {clock_out_hour}h, shift {shift_length:.2f}h, "
            "in {clock_in_time}, out {clock_out_time})".format(**row.to_dict())
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())


