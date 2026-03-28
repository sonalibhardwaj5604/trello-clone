import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '../DragContext';
import api from '../api';
import ListColumn from '../components/ListColumn';
import CardModal from '../components/CardModal';
import './Board.css';

function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const fetchBoard = useCallback(async () => {
    const r = await api.get(`/boards/${id}`);
    setBoard(r.data);
  }, [id]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  const addList = async () => {
    if (!newListTitle.trim()) return;
    await api.post('/lists', { title: newListTitle, boardId: Number(id) });
    setNewListTitle('');
    setAddingList(false);
    fetchBoard();
  };

  const onDragEnd = async (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'LIST') {
      const newLists = Array.from(board.lists);
      const [moved] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, moved);
      const updated = newLists.map((l, i) => ({ ...l, position: (i + 1) * 1000 }));
      setBoard({ ...board, lists: updated });
      await api.post('/lists/reorder', { lists: updated.map(l => ({ id: l.id, position: l.position })) });
      return;
    }

    if (type === 'CARD') {
      const srcList = board.lists.find(l => l.id === Number(source.droppableId));
      const dstList = board.lists.find(l => l.id === Number(destination.droppableId));
      const srcCards = Array.from(srcList.cards);
      const dstCards = source.droppableId === destination.droppableId
        ? srcCards : Array.from(dstList.cards);
      const [moved] = srcCards.splice(source.index, 1);
      dstCards.splice(destination.index, 0, { ...moved, listId: dstList.id });
      const updatedLists = board.lists.map(l => {
        if (l.id === srcList.id) return { ...l, cards: srcCards };
        if (l.id === dstList.id) return { ...l, cards: dstCards };
        return l;
      });
      setBoard({ ...board, lists: updatedLists });
      const allMoved = dstCards.map((c, i) => ({ id: c.id, position: (i + 1) * 1000, listId: dstList.id }));
      if (source.droppableId !== destination.droppableId) {
        const srcMoved = srcCards.map((c, i) => ({ id: c.id, position: (i + 1) * 1000, listId: srcList.id }));
        await api.post('/cards/reorder', { cards: [...allMoved, ...srcMoved] });
      } else {
        await api.post('/cards/reorder', { cards: allMoved });
      }
    }
  };

  if (!board) return <div className="loading">Loading...</div>;

  return (
    <div className="board-page" style={{ background: board.bgColor }}>
      <div className="board-navbar">
        <button className="back-btn" onClick={() => navigate('/')}>← Boards</button>
        <h2>{board.title}</h2>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="lists-container">
          {board.lists.map((list, index) => (
            <ListColumn
              key={list.id}
              list={list}
              index={index}
              boardMembers={board.members}
              onCardClick={(card) => setSelectedCard({ ...card, listId: list.id })}
              onUpdate={fetchBoard}
            />
          ))}
          <div className="add-list-btn-wrap">
            {addingList ? (
              <div className="add-list-form">
                <input autoFocus placeholder="List title..."
                  value={newListTitle}
                  onChange={e => setNewListTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addList()} />
                <div className="add-list-actions">
                  <button onClick={addList}>Add list</button>
                  <button onClick={() => setAddingList(false)}>✕</button>
                </div>
              </div>
            ) : (
              <button className="add-list-btn" onClick={() => setAddingList(true)}>
                + Add a list
              </button>
            )}
          </div>
        </div>
      </DragDropContext>
      {selectedCard && (
        <CardModal
          card={selectedCard}
          boardMembers={board.members}
          onClose={() => { setSelectedCard(null); fetchBoard(); }}
          onUpdate={(updated) => setSelectedCard(updated)}
        />
      )}
    </div>
  );
}

export default Board;