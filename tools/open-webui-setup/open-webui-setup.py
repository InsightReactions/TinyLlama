import sqlite3
import json
import os
import sys

DB_PATH="/srv/www/open-webui/webui.db"

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
CONFIG = json.load(open(os.path.join(SCRIPT_DIR, "config.json")))

# Check for test enviroment and use a different DB path if it's found
if not SCRIPT_DIR.startswith("/srv"):
    DB_PATH = os.path.join(SCRIPT_DIR, "sample_webui.db")

# Check if the database exists, and quit if it doesn't
if not os.path.exists(DB_PATH):
    print(f"ERROR: Database at path '{DB_PATH}' does not exist")
    sys.exit(1)

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

c.execute("SELECT data FROM config ORDER BY created_at DESC LIMIT 1")
conn.commit() 

db_config = json.loads(c.fetchone()[0])

# Ensure audio is conigured correctly
if "audio" not in db_config:
    db_config["audio"] = CONFIG["audio"]
else:
    db_config["audio"]["tts"]["openai"] = CONFIG["audio"]["tts"]["openai"]
    db_config["audio"]["tts"]["engine"] = CONFIG["audio"]["tts"]["engine"]

# Ensure image generation is configured correctly
if "image_generation" not in db_config:
    db_config["image_generation"] = CONFIG["image_generation"]
else:
    db_config["image_generation"]["engine"] = CONFIG["image_generation"]["engine"]
    db_config["image_generation"]["enable"] = CONFIG["image_generation"]["enable"]
    db_config["image_generation"]["comfyui"] = CONFIG["image_generation"]["comfyui"]

# Ensure UI is configured correctly
if db_config["ui"]["default_models"] is None or 0 == len(db_config["ui"]["default_models"]):
    db_config["ui"]["default_models"] = CONFIG["ui"]["default_models"]


# Update the database with the new config by replacing the existing row
c.execute("DELETE FROM config")
conn.commit()

# Update the database with the new config by replacing the existing row, also update version column
c.execute("INSERT INTO config (data, version) VALUES (?, ?)", (json.dumps(db_config), "0"))
conn.commit()

# TODO: Insert tools if they don't exist

# Vacuum the database to reclaim unused space
c.execute("VACUUM")
conn.commit()

conn.close()
