import json
import re

with open('github_projects_data.json', 'r', encoding='utf-8') as f:
    projects = json.load(f)

for p in projects:
    name = p['name']
    desc = p['description']
    files = p['root_files']
    readme = p['readme']
    
    print("="*60)
    print(f"PROJECT: {name}")
    print(f"Desc: {desc}")
    print(f"Primary Lang: {p['primaryLanguage']}, Languages: {p['languages']}")
    print(f"Root files: {files}")
    # print first 500 chars of readme
    print(f"README excerpt:\n{readme[:400]}")
