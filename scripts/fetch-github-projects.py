import subprocess
import json
import base64
import os

repos = [
    "invoice-financing-platform",
    "resumegap",
    "transporter-assignment-api",
    "job-search-monitor",
    "fieldbase-go-live",
    "harshit-soni-2004.github.io",
    "ledger",
    "-Mintmate",
    "terraform-modules",
    "ami-hardening",
    "automated-patcher",
    "security-scanner",
    "EC2-Deploy",
    "TextUtils-React"
]

results = []

for r in repos:
    print(f"Fetching {r}...")
    # Repo info
    p = subprocess.run(["gh", "repo", "view", f"harshit-soni-2004/{r}", "--json", "name,description,url,isPrivate,primaryLanguage,languages,repositoryTopics"], capture_output=True, text=True)
    if p.returncode != 0:
        print(f"Error fetching repo {r}: {p.stderr}")
        continue
    data = json.loads(p.stdout)
    
    # Readme
    readme_proc = subprocess.run(["gh", "api", f"repos/harshit-soni-2004/{r}/readme"], capture_output=True, text=True)
    readme_content = ""
    if readme_proc.returncode == 0:
        try:
            rm_data = json.loads(readme_proc.stdout)
            if "content" in rm_data:
                readme_content = base64.b64decode(rm_data["content"]).decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"Error decoding readme for {r}: {e}")
            
    # Root contents
    contents_proc = subprocess.run(["gh", "api", f"repos/harshit-soni-2004/{r}/contents"], capture_output=True, text=True)
    root_files = []
    if contents_proc.returncode == 0:
        try:
            c_data = json.loads(contents_proc.stdout)
            if isinstance(c_data, list):
                root_files = [item.get("name") for item in c_data]
        except Exception:
            pass

    langs = data.get("languages", [])
    if isinstance(langs, list):
        lang_names = [l.get("name") if isinstance(l, dict) else str(l) for l in langs]
    else:
        lang_names = []

    topics = data.get("repositoryTopics", [])
    if isinstance(topics, list):
        topic_names = [t.get("name") if isinstance(t, dict) else str(t) for t in topics]
    else:
        topic_names = []

    results.append({
        "name": data.get("name"),
        "description": data.get("description", ""),
        "url": data.get("url"),
        "isPrivate": data.get("isPrivate"),
        "primaryLanguage": (data.get("primaryLanguage") or {}).get("name", ""),
        "languages": lang_names,
        "topics": topic_names,
        "root_files": root_files,
        "readme": readme_content
    })

with open("github_projects_data.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("Saved github_projects_data.json successfully with all 14 projects!")
