#!/usr/bin/env python3
"""Upload clips to YouTube as SCHEDULED (private + publishAt) from a manifest.

First run opens a browser for one-time Google OAuth; saves token.json.
Resume-safe: entries already uploaded (have a videoId) are skipped.

Usage:
  python yt_upload.py --manifest /path/upload_manifest.json \
      --secret client_secret_....json [--token token.json] [--dry-run]
"""
import argparse, json, os, sys, time

from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]

def get_service(secret, token_path):
    creds = None
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception:
                creds = None
        if not creds:
            flow = InstalledAppFlow.from_client_secrets_file(secret, SCOPES)
            # opens browser; you sign in + Allow once
            creds = flow.run_local_server(port=0)
        with open(token_path, "w") as f:
            f.write(creds.to_json())
    return build("youtube", "v3", credentials=creds)

def upload_one(yt, e, dry):
    body = {
        "snippet": {
            "title": e["title"],
            "description": e["description"],
            "tags": e.get("tags", []),
            "categoryId": "24",  # Entertainment
        },
        "status": {
            "privacyStatus": e.get("privacyStatus", "private"),
            "selfDeclaredMadeForKids": bool(e.get("madeForKids", False)),
        },
    }
    # publishAt schedules a private video to go public later. For public-now
    # uploads (campaign clips that need a live link immediately), omit it.
    if e.get("publishAt"):
        body["status"]["publishAt"] = e["publishAt"]
    if dry:
        print(f"  [dry-run] would upload {os.path.basename(e['file'])} -> publish {e.get('publishAt','now')}")
        return "DRYRUN"
    media = MediaFileUpload(e["file"], chunksize=-1, resumable=True, mimetype="video/mp4")
    req = yt.videos().insert(part="snippet,status", body=body, media_body=media)
    resp = None
    while resp is None:
        status, resp = req.next_chunk()
    return resp["id"]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", required=True)
    ap.add_argument("--secret", required=True)
    ap.add_argument("--token", default=None)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=0, help="upload at most N new clips (0 = all)")
    a = ap.parse_args()
    token_path = a.token or os.path.join(os.path.dirname(os.path.abspath(a.manifest)), "token.json")

    entries = json.load(open(a.manifest))
    yt = get_service(a.secret, token_path)

    done = 0
    for e in entries:
        if e.get("uploaded"):
            print(f"skip (already uploaded): {os.path.basename(e['file'])} -> {e['uploaded']}")
            continue
        if a.limit and done >= a.limit:
            print(f"reached --limit {a.limit}; stopping. Re-run to continue the rest.")
            break
        print(f"uploading {os.path.basename(e['file'])} (score {e.get('score')}) ...")
        try:
            vid = upload_one(yt, e, a.dry_run)
        except HttpError as err:
            print(f"  ERROR: {err}", file=sys.stderr)
            # save progress so a re-run resumes
            json.dump(entries, open(a.manifest, "w"), indent=2)
            blob = err.content or b""
            if (err.resp.status in (403,) and b"quota" in blob) or \
               b"uploadLimitExceeded" in blob:
                print("  Daily upload limit hit - re-run tomorrow to continue "
                      "(manifest is resume-safe; done clips are skipped).", file=sys.stderr)
                break
            continue
        if vid != "DRYRUN":
            e["uploaded"] = f"https://youtu.be/{vid}"
            json.dump(entries, open(a.manifest, "w"), indent=2)
            when = f"scheduled {e['publishAt']}" if e.get("publishAt") else "PUBLIC now"
            print(f"  done -> {e['uploaded']}  ({when})")
            done += 1
            time.sleep(2)
    print(f"\nFinished. Uploaded {done} new clip(s).")
    if a.dry_run:
        print("(dry-run: nothing was actually uploaded)")

if __name__ == "__main__":
    main()
