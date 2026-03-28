import React from 'react';
import { useDrag } from '../DragContext';
import './CardItem.css';

function CardItem({ card, index, listId, onClick }) {
  const dragContext = useDrag();

  const completedItems = card.checklists?.reduce((acc, cl) =>
    acc + cl.items.filter(i => i.completed).length, 0) || 0;
  const totalItems = card.checklists?.reduce((acc, cl) =>
    acc + cl.items.length, 0) || 0;

  const handleDragStart = (e) => {
    if (!dragContext) return;
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    dragContext.startDrag({ type: 'CARD', source: { index, droppableId: String(listId) } });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    if (!dragContext) return;
    e.preventDefault();
    e.stopPropagation();
    dragContext.endDrag({ index, droppableId: String(listId) });
  };

  return (
    <div
      className="card-item"
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={onClick}
    >
      {card.labels?.length > 0 && (
        <div className="card-labels">
          {card.labels.map(l => (
            <span key={l.id} className="card-label" style={{ background: l.color }}>
              {l.text}
            </span>
          ))}
        </div>
      )}
      <p className="card-title">{card.title}</p>
      <div className="card-footer">
        {card.dueDate && (
          <span className="card-due">📅 {new Date(card.dueDate).toLocaleDateString()}</span>
        )}
        {totalItems > 0 && (
          <span className={`card-checklist ${completedItems === totalItems ? 'done' : ''}`}>
            ✓ {completedItems}/{totalItems}
          </span>
        )}
        {card.assignments?.length > 0 && (
          <div className="card-members">
            {card.assignments.map(a => (
              <span key={a.member.id} className="member-avatar"
                style={{ background: a.member.color }}>
                {a.member.avatar}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CardItem;