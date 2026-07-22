import os
import time
from urllib.parse import urlencode
import requests
from dotenv import load_dotenv

load_dotenv()

SCOPES = [
    "instagram_business_basic",
    "instagram_business_manage_insights", 
]

CLIENT_ID = os.getenv("INSTAGRAM_CLIENT_ID")
CLIENT_SECRET = os.getenv("INSTAGRAM_CLIENT_SECRET")
REDIRECT_URI = os.getenv(
    "INSTAGRAM_REDIRECT_URI",
    "http://localhost:8000/auth/instagram/callback",
)

AUTH_URL = "https://api.instagram.com/oauth/authorize"      
TOKEN_URL = "https://api.instagram.com/oauth/access_token" 
GRAPH = "https://graph.instagram.com"                   


def ig_get_auth_url(state: str) -> str:
    """Build the Instagram consent URL, carrying `state` to correlate the callback."""
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": ",".join(SCOPES),
        "response_type": "code",
        "state": state,
    }
    return f"{AUTH_URL}?{urlencode(params)}"


def _raise_with_body(r: requests.Response) -> None:
    """Like raise_for_status, but keeps Meta's error body (the actual reason)
    and drops the query string (it carries the secret and token)."""
    if not r.ok:
        endpoint = r.url.split("?")[0]
        raise requests.HTTPError(f"{r.status_code} from {endpoint}: {r.text}", response=r)


def ig_exchange_code(code: str) -> dict:
    """Exchange an auth code for a long-lived token dict. Our server stores it."""
    r = requests.post(TOKEN_URL, data={
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI,
        "code": code,
    })
    _raise_with_body(r)
    short = r.json()
    short_lived_token = short["access_token"]
    ig_user_id = short.get("user_id")

    r = requests.get(f"{GRAPH}/access_token", params={
        "grant_type": "ig_exchange_token",
        "client_secret": CLIENT_SECRET,
        "access_token": short_lived_token,
    })
    _raise_with_body(r)
    long = r.json()
    long_lived_token=long["access_token"]

    return {
        "access_token": long_lived_token,
        "user_id": ig_user_id,
        "expires_at": time.time() + int(long.get("expires_in", 60 * 24 * 3600)),
    }


def ig_credentials_from_token(token: dict) -> tuple[dict | None, dict]:
    """Validate a stored IG token from db, refreshing if within 5 days of expiry.
    Returns (valid_token_or_None, token_dict_to_persist).
    """
    if token.get("expires_at", 0) - time.time() < 5 * 24 * 3600:
        r = requests.get(f"{GRAPH}/refresh_access_token", params={
            "grant_type": "ig_refresh_token",
            "access_token": token["access_token"],
        })
        if r.ok:
            data = r.json()
            token["access_token"] = data["access_token"]
            token["expires_at"] = time.time() + int(data.get("expires_in", 60 * 24 * 3600))
    valid = token if token.get("expires_at", 0) > time.time() else None
    return valid, token
