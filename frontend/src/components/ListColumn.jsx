import React, { useState } from 'react';
import { useDrag } from '../DragContext';
import CardItem from './CardItem';
import api from '../api';
import './ListColumn.css';

function ListColumn({ list, index, boardMembers, onCardClick, onUpdate }) {
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [dragOver, setDragOver] = useState(false);
  const { dragging, startDrag, endDrag } = useDrag();

  const addCard = async () => {
    if (!newCardTitle.trim()) return;
    await api.post('/cards', { title: newCardTitle, listId: list.id });
    setNewCardTitle('');
    setAddingCard(false);
    onUpdate();
  };

  const updateListTitle = async () => {
    if (!listTitle.trim()) return;
    await api.put(`/lists/${list.id}`, { title: listTitle });
    setEditingTitle(false);
    onUpdate();
  };

  const deleteList = async () => {
    if (!window.confirm(`Delete "${list.title}"?`)) return;
    await api.delete(`/lists/${list.id}`);
    onUpdate();
  };

  const handleListDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    startDrag({ type: 'LIST', source: { index, droppableId: 'board' } });
  };

  const handleListDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleListDrop = (e) => {
    e.preventDefault();
    if (dragging?.type === 'LIST') {
      endDrag({ index, droppableId: 'board' });
    }
  };

  const handleCardDragOver = (e) => {
    e.preventDefault();
    if (dragging?.type === 'CARD') setDragOver(true);
  };

  const handleCardDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (dragging?.type === 'CARD') {
      endDrag({ index: list.cards.length, droppableId: String(list.id) });
    }
  };

  return (
    <div
      className="list-column"
      draggable
      onDragStart={handleListDragStart}
      onDragOver={handleListDragOver}
      onDrop={handleListDrop}
    >
      <div className="list-header">
        {editingTitle ? (
          <input autoFocus value={listTitle}
            onChange={e => setListTitle(e.target.value)}
            onBlur={updateListTitle}
            onKeyDown={e => e.key === 'Enter' && updateListTitle()}
            className="list-title-input" />
        ) : (
          <h3 onClick={() => setEditingTitle(true)}>{list.title}</h3>
        )}
        <button className="list-delete-btn" onClick={deleteList}>✕</button>
      </div>

      <div
        className={`cards-container ${dragOver ? 'dragging-over' : ''}`}
        onDragOver={handleCardDragOver}
        onDrop={handleCardDrop}
        onDragLeave={() => setDragOver(false)}
      >
        {list.cards.map((card, idx) => (
          <CardItem
            key={card.id}
            card={card}
            index={idx}
            listId={list.id}
            onClick={() => onCardClick(card)}
            onUpdate={onUpdate}
          />
        ))}
      </div>

      {addingCard ? (
        <div className="add-card-form">
          <textarea autoFocus placeholder="Enter card title..."
            value={newCardTitle}
            onChange={e => setNewCardTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && addCard()} />
          <div className="add-card-actions">
            <button onClick={addCard}>Add card</button>
            <button onClick={() => setAddingCard(false)}>✕</button>
          </div>
        </div>
      ) : (
        <button className="add-card-btn" onClick={() => setAddingCard(true)}>+ Add a card</button>
      )}
    </div>
  );
}

export default ListColumn;