import { useEffect, useState } from "react";
import "./App.css";

const API_URL = `${import.meta.env.VITE_API_URL}/habits`;

type Habit = {
  id: number;
  name: string;
  completed: boolean;
  streak: number;
  last_completed: string | null;
};

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");

  const fetchHabits = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    setHabits(data);
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const addHabit = async () => {
    if (!newHabit.trim()) return;

    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newHabit,
        completed: false,
      }),
    });

    setNewHabit("");
    fetchHabits();
  };

  const deleteHabit = async (id: number) => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    fetchHabits();
  };

  const completedCount = habits.filter((habit) => habit.completed).length;
  const progress =
    habits.length === 0 ? 0 : (completedCount / habits.length) * 100;

  const toggleHabit = async (id: number, completed: boolean) => {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed: completed,
      }),
    });

    fetchHabits();
  };

  return (
    <div className="app-container">
      <h1>Habit Tracker</h1>
      <p className="subtitle">
        Build strong habits and stay consistent every day.
      </p>

      <div className="summary-card">
        <h3>📅 Today</h3>
        <p>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="summary-card">
        <h3>Today's Progress</h3>
        <p>Total Habits: {habits.length}</p>
        <p>Completed: {completedCount}</p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="input-section">
        <input
          type="text"
          placeholder="Enter a new habit..."
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHabit()}
        />
        <button onClick={addHabit}>Add Habit</button>
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">
          <p>No habits added yet. Start by creating one!</p>
        </div>
      ) : (
        <ul>
          {habits.map((habit) => (
            <li key={habit.id}>
              <input
                type="checkbox"
                checked={habit.completed}
                onChange={() => toggleHabit(habit.id, !habit.completed)}
              />

              <span
                style={{
                  flex: 1,
                  textDecoration: habit.completed ? "line-through" : "none",
                  opacity: habit.completed ? 0.7 : 1,
                }}
              >
                {habit.name}
              </span>

              <span>🔥 {habit.streak} day streak</span>

              <button onClick={() => deleteHabit(habit.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
