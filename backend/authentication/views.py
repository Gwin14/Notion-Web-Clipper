from django.shortcuts import redirect
import requests
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.conf import settings
from urllib.parse import quote, urlencode
import base64
import secrets
from urllib.parse import urlencode

from decouple import config

NOTION_CLIENT_ID = config("NOTION_CLIENT_ID")
NOTION_CLIENT_SECRET = config("NOTION_CLIENT_SECRET")
REDIRECT_URI = config("NOTION_REDIRECT_URI")  # ex: http://localhost:8000/auth/callback
EXTENSION_ID = config("EXTENSION_ID") 


import secrets


def notion_login(request):
    # Generate a random state token

    print("CLIENT_ID:", NOTION_CLIENT_ID)
    print("CLIENT_SECRET:", NOTION_CLIENT_SECRET)
    print("REDIRECT_URI:", REDIRECT_URI)

    state = secrets.token_urlsafe(16)
    request.session["oauth_state"] = state  # Store in session for verification later

    params = {
        "client_id": NOTION_CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "owner": "user",
        "state": state,
    }
    auth_url = f"https://api.notion.com/v1/oauth/authorize?{urlencode(params)}"
    return HttpResponseRedirect(auth_url)


def notion_callback(request):

    print("CLIENT_ID:", NOTION_CLIENT_ID)
    print("CLIENT_SECRET:", NOTION_CLIENT_SECRET)
    print("REDIRECT_URI:", REDIRECT_URI)

    # Verify state matches
    state = request.GET.get("state")
    if not state or state != request.session.get("oauth_state"):
        return JsonResponse({"error": "Invalid state parameter"}, status=400)

    code = request.GET.get("code")
    if not code:
        return JsonResponse({"error": "Code not found"}, status=400)

    token_url = "https://api.notion.com/v1/oauth/token"

    # Create Basic Auth header
    auth_string = f"{NOTION_CLIENT_ID}:{NOTION_CLIENT_SECRET}"
    auth_bytes = auth_string.encode("ascii")
    base64_auth = base64.b64encode(auth_bytes).decode("ascii")

    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {base64_auth}",
    }

    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
    }

    response = requests.post(token_url, data=data, headers=headers)

    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get("access_token")

        # Monta manualmente a resposta de redirecionamento
        redirect_url = f"chrome-extension://{EXTENSION_ID}/auth_complete.html#access_token={quote(access_token)}"
        return HttpResponse(
            status=302,
            headers={"Location": redirect_url}
        )
    else:
        return JsonResponse(
            {"error": "Failed to exchange code for token", "details": response.text},
            status=400,
        )
