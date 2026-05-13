from fastapi.middleware.cors import CORSMiddleware


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, datetime, timedelta
import json
import os

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from your Vercel frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Allow React frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FILE_NAME = "habits.json"


def load_habits():
    if not os.path.exists(FILE_NAME):
        return []

    try:
        with open(FILE_NAME, "r", encoding="utf-8") as file:
            content = file.read().strip()
            if not content:
                return []
            return json.loads(content)
    except json.JSONDecodeError:
        return []


def save_habits(habits):
    with open(FILE_NAME, "w", encoding="utf-8") as file:
        json.dump(habits, file, indent=4)


@app.get("/")
def home():
    return {"message": "Habit Tracker API is running successfully!"}


@app.get("/habits")
def get_habits():
    return load_habits()


@app.post("/habits")
def add_habit(habit: dict):
    habits = load_habits()

    next_id = 1
    if habits:
        next_id = max(h["id"] for h in habits) + 1

    new_habit = {
        "id": next_id,
        "name": habit.get("name", "Untitled Habit"),
        "completed": False,
        "streak": 0,
        "last_completed": None,
    }

    habits.append(new_habit)
    save_habits(habits)

    return {"message": "Habit added successfully", "habit": new_habit}


@app.delete("/habits/{habit_id}")
def delete_habit(habit_id: int):
    habits = load_habits()
    updated_habits = [h for h in habits if h["id"] != habit_id]
    save_habits(updated_habits)

    return {"message": "Habit deleted successfully"}


@app.put("/habits/{habit_id}")
def update_habit(habit_id: int, updated_data: dict):
    habits = load_habits()
    today = date.today()

    for habit in habits:
        if habit["id"] == habit_id:
            completed = updated_data.get("completed", habit["completed"])

            if completed and not habit["completed"]:
                last_completed = habit.get("last_completed")

                if last_completed:
                    last_date = datetime.strptime(last_completed, "%Y-%m-%d").date()

                    if last_date == today - timedelta(days=1):
                        habit["streak"] = habit.get("streak", 0) + 1
                    elif last_date == today:
                        pass
                    else:
                        habit["streak"] = 1
                else:
                    habit["streak"] = 1

                habit["last_completed"] = today.isoformat()

            elif not completed:
                # Unchecking only affects today's completion state.
                # We keep the streak history intact.
                pass

            habit["completed"] = completed

            save_habits(habits)

            return {"message": "Habit updated successfully", "habit": habit}

    return {"message": "Habit not found"}
