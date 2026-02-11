import requests
import json

url = "https://jn442qrdmg.execute-api.us-east-1.amazonaws.com/book"
payload = {
    "name": "SHAIK MOHAMMAD KAIF",
    "room": "Premium Room",
    "checkin": "2026-03-24",
    "checkout": "2026-03-26"
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
