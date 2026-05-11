import { useEffect, useState } from "react";

interface Habit {
  name: string;
  completed: boolean;
  streak: number;
  lastCompletedDate: string | null;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const savedHabits = localStorage.getItem("habits");
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }

    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  const addHabit = () => {
    if (habitName.trim() === "") return;

    const newHabit: Habit = {
      name: habitName,
      completed: false,
      streak: 0,
      lastCompletedDate: null,
    };

    setHabits([...habits, newHabit]);
    setHabitName("");
  };

  const deleteHabit = (indexToDelete: number) => {
    const updatedHabits = habits.filter((_, index) => index !== indexToDelete);
    setHabits(updatedHabits);
  };

  const editHabit = (indexToEdit: number) => {
    const newName = prompt("Enter new habit name:");

    if (!newName || newName.trim() === "") {
      return;
    }

    const updatedHabits = habits.map((habit, index) => {
      if (index === indexToEdit) {
        return {
          ...habit,
          name: newName,
        };
      }

      return habit;
    });

    setHabits(updatedHabits);
  };

  const toggleHabit = (indexToToggle: number) => {
    const today = new Date().toDateString();

    const updatedHabits = habits.map((habit, index) => {
      if (index !== indexToToggle) {
        return habit;
      }

      const newCompleted = !habit.completed;
      let newStreak = habit.streak;
      let newLastCompletedDate = habit.lastCompletedDate;

      if (newCompleted && habit.lastCompletedDate !== today) {
        newStreak = habit.streak + 1;
        newLastCompletedDate = today;
      }

      return {
        ...habit,
        completed: newCompleted,
        streak: newStreak,
        lastCompletedDate: newLastCompletedDate,
      };
    });

    setHabits(updatedHabits);
  };

  const totalHabits = habits.length;
  const completedHabits = habits.filter((habit) => habit.completed).length;

  const progress =
    totalHabits === 0 ? 0 : Math.round((completedHabits / totalHabits) * 100);

  const filteredHabits = habits.filter((habit) =>
    habit.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      <h1>Habit Tracker</h1>
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{ marginBottom: "20px" }}
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <h3>📊 Progress Summary</h3>
      <p>Total Habits: {totalHabits}</p>
      <p>Completed Today: {completedHabits}</p>
      <p>Progress: {progress}%</p>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <input
        type="text"
        placeholder="Search habits..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "10px", width: "100%", padding: "8px" }}
      />

      <input
        type="text"
        placeholder="Enter a habit"
        value={habitName}
        onChange={(e) => setHabitName(e.target.value)}
      />

      <button onClick={addHabit} style={{ marginLeft: "10px" }}>
        Add Habit
      </button>

      <ul>
        {filteredHabits.map((habit, index) => (
          <li key={index}>
            <input
              type="checkbox"
              checked={habit.completed}
              onChange={() => toggleHabit(index)}
            />

            <span
              style={{
                marginLeft: "10px",
                textDecoration: habit.completed ? "line-through" : "none",
              }}
            >
              {habit.name}
            </span>

            <span style={{ marginLeft: "10px" }}>
              🔥 {habit.streak} day{habit.streak !== 1 ? "s" : ""}
            </span>

            <button
              onClick={() => editHabit(index)}
              style={{ marginLeft: "10px" }}
            >
              Edit
            </button>

            <button
              onClick={() => deleteHabit(index)}
              style={{ marginLeft: "10px" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
