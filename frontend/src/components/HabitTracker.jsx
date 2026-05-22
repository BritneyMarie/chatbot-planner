import { useState } from 'react';
import './HabitTracker.css';

const DEFAULT_HABITS = [
  { id: 1, name: 'Exercise', emoji: '💪' },
  { id: 2, name: 'Read', emoji: '📖' },
  { id: 3, name: 'Meditate', emoji: '🧘' },
  { id: 4, name: 'Water', emoji: '💧' },
  { id: 5, name: 'Sleep 8h', emoji: '😴' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HabitTracker = () => {
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [completions, setCompletions] = useState({});
  const [newHabit, setNewHabit] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const toggleCompletion = (habitId, dayIndex) => {
    const key = `${habitId}-${dayIndex}`;
    setCompletions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getHabitProgress = (habitId) => {
    let count = 0;
    for (let d = 0; d < 7; d++) {
      if (completions[`${habitId}-${d}`]) count++;
    }
    return Math.round((count / 7) * 100);
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    const id = Date.now();
    setHabits(prev => [...prev, { id, name: newHabit.trim(), emoji: '✨' }]);
    setNewHabit('');
    setShowAdd(false);
  };

  const removeHabit = (id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div className="habit-tracker">
      <div className="habit-header">
        <h3>Weekly Habit Tracker</h3>
        <button className="habit-add-btn" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '✕' : '+ Add'}
        </button>
      </div>

      {showAdd && (
        <div className="habit-add-form">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="New habit name..."
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
          />
          <button onClick={addHabit}>Add</button>
        </div>
      )}

      <div className="habit-grid">
        <div className="habit-grid-header">
          <div className="habit-name-col">Habit</div>
          {DAYS.map(day => (
            <div key={day} className="habit-day-col">{day}</div>
          ))}
          <div className="habit-progress-col">%</div>
        </div>

        {habits.map(habit => (
          <div key={habit.id} className="habit-row">
            <div className="habit-name-col">
              <span className="habit-emoji">{habit.emoji}</span>
              <span className="habit-label">{habit.name}</span>
              <button className="habit-remove" onClick={() => removeHabit(habit.id)}>&#215;</button>
            </div>
            {DAYS.map((_, dayIndex) => (
              <div
                key={dayIndex}
                className={`habit-cell ${completions[`${habit.id}-${dayIndex}`] ? 'completed' : ''}`}
                onClick={() => toggleCompletion(habit.id, dayIndex)}
              >
                {completions[`${habit.id}-${dayIndex}`] && '✓'}
              </div>
            ))}
            <div className="habit-progress-col">
              <div className="habit-progress-bar">
                <div
                  className="habit-progress-fill"
                  style={{ width: `${getHabitProgress(habit.id)}%` }}
                />
              </div>
              <span className="habit-progress-text">{getHabitProgress(habit.id)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitTracker;
