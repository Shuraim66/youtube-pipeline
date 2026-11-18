#!/usr/bin/env python3
"""Spend watchdog: terminate a pod when the account balance falls below a floor. Usage: runpod_guard.py <pod_id> <floor_usd> [poll_s]"""
import sys, time
sys.path.insert(0, __file__.rsplit("/", 1)[0])
from runpod_api import balance, pods, terminate
pid, floor = sys.argv[1], float(sys.argv[2]); poll = int(sys.argv[3]) if len(sys.argv) > 3 else 90
while True:
    try:
        b, s = balance(); alive = [p["id"] for p in pods()]
        print(time.strftime("%H:%M:%S"), f"balance=${b:.3f} spend/hr=${s:.2f} pod_alive={pid in alive}", flush=True)
        if pid not in alive: print("pod gone, guard exits"); break
        if b < floor: terminate(pid); print(f"FLOOR HIT (${b:.3f} < ${floor}): terminated {pid}", flush=True); break
    except Exception as e: print("guard error", str(e)[:120], flush=True)
    time.sleep(poll)
