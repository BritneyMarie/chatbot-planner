import { useState } from 'react';
import './PriorityNotes.css';

const PriorityNotes = () => {
  const [priorities, setPriorities] = useState([
    { id: 1, text: 'Finish weekly report' },
    { id: 2, text: 'Schedule team meeting' },
    { id: 3, text: 'Update project timeline' },
  ]);
  const [notes, setNotes] = useState(
    'Remember to check in with the team about the deadline.\n\nIdeas for the next sprint planning session...'
  );
  const [newPriority, setNewPriority] = useState('');

  const addPriority = () => {
    if (!newPriority.trim()) return;
    setPriorities(prev => [...prev, { id: Date.now(), text: newPriority.trim() }]);
    setNewPriority('');
  };

  const removePriority = (id) => {
    setPriorities(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="priority-notes">
      <div className="pn-grid">
        {/* Priorities Section */}
        <div className="pn-section priorities-section">
          <h3>Priorities</h3>
          <div className="priorities-list">
            {priorities.map((p, index) => (
              <div key={p.id} className="priority-item">
                <span className="priority-number">{index + 1}</span>
                <span className="priority-text">{p.text}</span>
                <button className="priority-remove" onClick={() => removePriority(p.id)}>&#215;</button>
              </div>
            ))}
          </div>
          <div className="priority-add">
            <input
              type="text"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              placeholder="Add priority..."
              onKeyDown={(e) => e.key === 'Enter' && addPriority()}
            />
            <button onClick={addPriority}>+</button>
          </div>
        </div>

        {/* Notes Section */}
        <div className="pn-section notes-section">
          <h3>Notes</h3>
          <textarea
            className="notes-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your notes here..."
          />
        </div>
      </div>
    </div>
  );
};

export default PriorityNotes;
