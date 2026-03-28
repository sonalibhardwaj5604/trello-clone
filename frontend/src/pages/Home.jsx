import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Home.css';

function Home() {
  const [boards, setBoards] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/boards').then(r => setBoards(r.data));
  }, []);

  const createBoard = async () => {
    if (!newTitle.trim()) return;
    const r = await api.post('/boards', { title: newTitle });
    setBoards([...boards, r.data]);
    setNewTitle('');
    setCreating(false);
    navigate(`/board/${r.data.id}`);
  };

  return (
    <div className="home">
      <div className="home-header">
        <h1>Your Boards</h1>
      </div>
      <div className="boards-grid">
        {boards.map(b => (
          <div key={b.id} className="board-card" style={{ background: b.bgColor }} onClick={() => navigate(`/board/${b.id}`)}>
            <span>{b.title}</span>
          </div>
        ))}
        {creating ? (
          <div className="board-card new-board-form">
            <input autoFocus placeholder="Board title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && createBoard()} />
            <div className="new-board-actions">
              <button onClick={createBoard}>Create</button>
              <button onClick={() => setCreating(false)}>✕</button>
            </div>
          </div>
        ) : (
          <div className="board-card create-board" onClick={() => setCreating(true)}>
            <span>+ Create new board</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;