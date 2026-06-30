import subprocess
import os

os.chdir(r"d:\Afsara\Codes\Afsara's Projects\VoiceBridge")

result = subprocess.run(['git', 'diff', '--name-only'], capture_output=True, text=True)
files = [line.strip() for line in result.stdout.split('\n') if line.strip()]

TARGET_COMMITS = 35

print(f"Found {len(files)} files to commit.")

def get_commit_message(filename):
    if "README.md" in filename:
        return "updated readme.md"
    elif "ArasaacModal.js" in filename or "arasaac" in filename:
        return "added ARASAAC characteristics"
    elif "models.py" in filename and "icons" in filename:
        return "add more categories"
    elif "gradle" in filename:
        return "fixed gradle"
    elif "FolderDPs.js" in filename:
        return "added folder library feature"
    elif "BoardEditor.js" in filename:
        return "updated board editor UI and nested folders"
    elif "Boards.js" in filename:
        return "updated boards listing"
    elif "Icons.js" in filename:
        return "updated icons category logic"
    elif "serializers" in filename:
        return "updated api serializers for new structures"
    elif "views.py" in filename:
        return "updated api views and logic"
    elif "migrations" in filename:
        return "applied database migrations"
    elif "models.py" in filename:
        return "updated database models"
    elif "urls.py" in filename:
        return "updated api routing"
    elif "App.js" in filename:
        return "updated main react app routing"
    elif "Layout.js" in filename:
        return "updated app layout and navigation"
    elif "Journal.js" in filename:
        return "updated journal ui"
    elif "Community.js" in filename:
        return "updated community hub"
    elif "VoiceBridgeApp" in filename or "MainActivity" in filename:
        return "updated core android app components"
    elif "BoardAdapter" in filename:
        return "updated android board adapter"
    elif "SyncManager" in filename:
        return "updated android sync engine"
    elif ".xml" in filename:
        return "updated android ui layouts"
    elif "settings.py" in filename:
        return "updated backend settings"
    elif "requirements.txt" in filename:
        return "updated backend dependencies"
    else:
        return f"updated {os.path.basename(filename)}"

# Put README first if it's there
if "README.md" in files:
    files.remove("README.md")
    files.insert(0, "README.md")

for i in range(TARGET_COMMITS - 1):
    file_to_commit = files[i]
    msg = get_commit_message(file_to_commit)
    
    subprocess.run(['git', 'add', file_to_commit])
    subprocess.run(['git', 'commit', '-m', msg])
    print(f"Commit {i+1}: {msg} ({file_to_commit})")

remaining_files = files[TARGET_COMMITS - 1:]
for f in remaining_files:
    subprocess.run(['git', 'add', f])

final_msg = "finalizing system updates and bug fixes"
subprocess.run(['git', 'commit', '-m', final_msg])
print(f"Commit {TARGET_COMMITS}: {final_msg} (and {len(remaining_files)} files)")

print("Done. Checking rev-list...")
subprocess.run(['git', 'rev-list', '--count', 'HEAD'])
