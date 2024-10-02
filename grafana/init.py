import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

GRAFANA_URL = "http://localhost:3000"

GRAFANA_USER = os.getenv("GRAFANA_ADMIN_USER")
GRAFANA_PASSWORD = os.getenv("GRAFANA_ADMIN_PASSWORD")

print(f"Grafana URL: {GRAFANA_URL}")
print(f"Grafana User: {GRAFANA_USER}")
print(f"Grafana Password: {GRAFANA_PASSWORD}")

PG_HOST = os.getenv("POSTGRES_HOST", "postgres")
PG_DB = os.getenv("POSTGRES_DB")
PG_USER = os.getenv("POSTGRES_USER")
PG_PASSWORD = os.getenv("POSTGRES_PASSWORD")
PG_PORT = os.getenv("POSTGRES_PORT", "5432")

def create_api_key():
    auth = (GRAFANA_USER, GRAFANA_PASSWORD)
    headers = {"Content-Type": "application/json"}
    payload = {
        "name": "ProgrammaticKey",
        "role": "Admin",
    }
    response = requests.post(
        f"{GRAFANA_URL}/api/auth/keys", auth=auth, headers=headers, json=payload
    )

    if response.status_code == 200:
        print("API key created successfully")
        return response.json()["key"]
    elif response.status_code == 409:  # Conflict, key already exists
        print("API key already exists, updating...")
        keys_response = requests.get(f"{GRAFANA_URL}/api/auth/keys", auth=auth)
        if keys_response.status_code == 200:
            for key in keys_response.json():
                if key["name"] == "ProgrammaticKey":
                    delete_response = requests.delete(
                        f"{GRAFANA_URL}/api/auth/keys/{key['id']}", auth=auth
                    )
                    if delete_response.status_code == 200:
                        print("Existing key deleted")
                        return create_api_key()
        print("Failed to update API key")
        return None
    else:
        print(f"Failed to create API key: {response.text}")
        return None

def create_or_update_datasource(api_key):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    datasource_payload = {
        "name": "PostgreSQL",
        "type": "postgres",
        "url": f"{PG_HOST}:{PG_PORT}",
        "access": "proxy",
        "user": PG_USER,
        "database": PG_DB,
        "basicAuth": False,
        "isDefault": True,
        "jsonData": {"sslmode": "disable", "postgresVersion": 1300},
        "secureJsonData": {"password": PG_PASSWORD},
    }

    print("Datasource payload:")
    print(json.dumps(datasource_payload, indent=2))

    response = requests.get(
        f"{GRAFANA_URL}/api/datasources/name/{datasource_payload['name']}",
        headers=headers,
    )

    if response.status_code == 200:
        existing_datasource = response.json()
        datasource_id = existing_datasource["id"]
        print(f"Updating existing datasource with id: {datasource_id}")
        response = requests.put(
            f"{GRAFANA_URL}/api/datasources/{datasource_id}",
            headers=headers,
            json=datasource_payload,
        )
    else:
        print("Creating new datasource")
        response = requests.post(
            f"{GRAFANA_URL}/api/datasources", headers=headers, json=datasource_payload
        )

    print(f"Response status code: {response.status_code}")
    print(f"Response headers: {response.headers}")
    print(f"Response content: {response.text}")

    if response.status_code in [200, 201]:
        print("Datasource created or updated successfully")
        return response.json().get("datasource", {}).get("uid") or response.json().get("uid")
    else:
        print(f"Failed to create or update datasource: {response.text}")
        return None

def update_dashboard_datasource_uid(dashboard_json, new_uid):
    for panel in dashboard_json.get("panels", []):
        if isinstance(panel.get("datasource"), dict):
            panel["datasource"]["uid"] = new_uid
        if isinstance(panel.get("targets"), list):
            for target in panel["targets"]:
                if isinstance(target.get("datasource"), dict):
                    target["datasource"]["uid"] = new_uid
    return dashboard_json

def create_dashboard(api_key, datasource_uid):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    dashboard_file = "dashboard.json"

    try:
        with open(dashboard_file, "r") as f:
            dashboard_json = json.load(f)
    except FileNotFoundError:
        print(f"Error: {dashboard_file} not found.")
        return
    except json.JSONDecodeError as e:
        print(f"Error decoding {dashboard_file}: {str(e)}")
        return

    print("Dashboard JSON loaded successfully.")

    # Update datasource UID in the dashboard JSON
    dashboard_json = update_dashboard_datasource_uid(dashboard_json, datasource_uid)
    print(f"Updated datasource UID to {datasource_uid} for all panels/targets.")

    # Remove keys that shouldn't be included when creating a new dashboard
    dashboard_json.pop("id", None)
    dashboard_json.pop("uid", None)
    dashboard_json.pop("version", None)

    # Prepare the payload
    dashboard_payload = {
        "dashboard": dashboard_json,
        "overwrite": True,
        "message": "Updated by Python script",
    }

    print("Sending dashboard creation request...")

    response = requests.post(
        f"{GRAFANA_URL}/api/dashboards/db", headers=headers, json=dashboard_payload
    )

    print(f"Response status code: {response.status_code}")
    print(f"Response content: {response.text}")

    if response.status_code == 200:
        print("Dashboard created successfully")
        return response.json().get("uid")
    else:
        print(f"Failed to create dashboard: {response.text}")
        return None

def main():
    api_key = create_api_key()
    if not api_key:
        print("API key creation failed")
        return

    datasource_uid = create_or_update_datasource(api_key)
    if not datasource_uid:
        print("Datasource creation failed")
        return

    dashboard_uid = create_dashboard(api_key, datasource_uid)
    if not dashboard_uid:
        print("Dashboard creation failed")
        return

    print("Initialization complete. Datasource and dashboard created successfully.")

if __name__ == "__main__":
    main()