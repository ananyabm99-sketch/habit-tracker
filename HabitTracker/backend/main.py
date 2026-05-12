from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def home():
    return {"message": "Habit Tracker API is running successfully!"}
