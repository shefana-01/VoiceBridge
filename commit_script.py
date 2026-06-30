import subprocess
import os

# Ensure we are in the right directory
os.chdir(r"d:\Afsara\Codes\Afsara's Projects\VoiceBridge")

# Get all changed/untracked files
result = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
lines = [line.strip() for line in result.stdout.split('\n') if line.strip()]

files = []
for line in lines:
    # Output looks like " M file.txt" or "?? file.txt"
    filepath = line[3:]
    files.append(filepath)

# Target number of commits
TARGET_COMMITS = 36

print(f"Found {len(files)} files to commit.")

# We want exactly 36 commits.
# We will do 35 individual commits, and the 36th commit will contain all the remaining files.

# Ensure we have at least 36 files. If we have fewer, we might have to split hunks (not easily automatable).
if len(files) < TARGET_COMMITS:
    print(f"ERROR: Only {len(files)} files, cannot make {TARGET_COMMITS} commits safely.")
    exit(1)

# Helper function to get a good commit message based on the file name
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

# First 35 files get their own commit
for i in range(TARGET_COMMITS - 1):
    file_to_commit = files[i]
    msg = get_commit_message(file_to_commit)
    
    # special case for README
    if "README.md" in file_to_commit.upper():
        msg = "updated readme.md"

    subprocess.run(['git', 'add', file_to_commit])
    subprocess.run(['git', 'commit', '-m', msg])
    print(f"Commit {i+1}: {msg} ({file_to_commit})")

# The 36th commit gets everything else
remaining_files = files[TARGET_COMMITS - 1:]
for f in remaining_files:
    subprocess.run(['git', 'add', f])

# Generate a message for the remaining chunk
messages = set()
for f in remaining_files:
    if "README.md" in f.upper():
        messages.add("updated readme.md")
    else:
        messages.add(get_commit_message(f))

# Just use a generic message for the bulk commit or combine them
final_msg = "finalizing system updates and bug fixes"
if "updated readme.md" in messages:
    final_msg = "updated readme.md"

subprocess.run(['git', 'commit', '-m', final_msg])
print(f"Commit {TARGET_COMMITS}: {final_msg} (and {len(remaining_files)} files)")

print("Done. Check git log.")
