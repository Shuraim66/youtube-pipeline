#!/usr/bin/env python3
"""Tiny RunPod GraphQL helper (balance / pods / deploy / terminate). Key: RUNPOD_API_KEY from env or ./.env (never printed)."""
import json, os, sys, urllib.request
from pathlib import Path

def _key():
    k = os.environ.get("RUNPOD_API_KEY")
    if not k:
        env = Path(__file__).resolve().parent.parent / ".env"
        if env.exists():
            for ln in env.read_text().splitlines():
                if ln.startswith("RUNPOD_API_KEY="):
                    k = ln.split("=", 1)[1].strip().strip('"\'')
    if not k:
        sys.exit("RUNPOD_API_KEY not found in env or .env")
    return k

def gql(query, variables=None):
    req = urllib.request.Request("https://api.runpod.io/graphql", data=json.dumps({"query": query, "variables": variables or {}}).encode(),
                                 headers={"Authorization": f"Bearer {_key()}", "Content-Type": "application/json", "User-Agent": "aurelis-runpod/1.0"})
    r = json.load(urllib.request.urlopen(req, timeout=60))
    if r.get("errors"): raise RuntimeError(json.dumps(r["errors"])[:600])
    return r["data"]

def balance():
    m = gql("query { myself { clientBalance currentSpendPerHr } }")["myself"]
    return float(m["clientBalance"]), float(m["currentSpendPerHr"] or 0)

def pods():
    return gql("query { myself { pods { id name desiredStatus costPerHr gpuCount machine { gpuDisplayName } runtime { uptimeInSeconds ports { ip privatePort publicPort isIpPublic } } } } }")["myself"]["pods"]

def terminate(pod_id):
    gql("mutation($i: PodTerminateInput!){ podTerminate(input:$i) }", {"i": {"podId": pod_id}})

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "balance"
    if cmd == "balance":
        b, s = balance(); print(f"balance=${b:.4f} spend/hr=${s:.4f}")
    elif cmd == "pods":
        for p in pods(): print(p["id"], p["name"], p["desiredStatus"], p["costPerHr"], (p.get("machine") or {}).get("gpuDisplayName"))
        if not pods(): print("no pods")
    elif cmd == "terminate": terminate(sys.argv[2]); print("terminated", sys.argv[2])
