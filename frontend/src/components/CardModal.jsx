import React, { useState } from 'react';
import api from '../api';
import './CardModal.css';

function CardModal({ card, boardMembers, onClose, onUpdate }) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [addingChecklist, setAddingChecklist] = useState(false);
  const [newItemTexts, setNewItemTexts] = useState({});
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.split('T')[0] : '');

  const saveTitle = async () => {
    if (!title.trim()) return;
    const r = await api.put(`/cards/${card.id}`, { title });
    onUpdate(r.data);
    setEditingTitle(false);
  };

  const saveDesc = async () => {
    const r = await api.put(`/cards/${card.id}`, { description });
    onUpdate(r.data);
    setEditingDesc(false);
  };

  const saveDueDate = async (val) => {
    setDueDate(val);
    const r = await api.put(`/cards/${card.id}`, { dueDate: val ? new Date(val).toISOString() : null });
    onUpdate(r.data);
  };

  const toggleMember = async (memberId) => {
    const assigned = card.assignments?.some(a => a.member.id === memberId);
    const r = await api.put(`/cards/${card.id}`, assigned ? { removeMemberId: memberId } : { assignMemberId: memberId });
    onUpdate(r.data);
  };

  const addLabel = async (color, text) => {
    const r = await api.put(`/cards/${card.id}`, { addLabel: { color, text } });
    onUpdate(r.data);
  };

  const removeLabel = async (labelId) => {
    const r = await api.put(`/cards/${card.id}`, { removeLabelId: labelId });
    onUpdate(r.data);
  };

  const addChecklist = async () => {
    if (!newChecklistTitle.trim()) return;
    const r = await api.post(`/cards/${card.id}/checklists`, { title: newChecklistTitle });
    onUpdate({ ...card, checklists: [...(card.checklists || []), r.data] });
    setNewChecklistTitle('');
    setAddingChecklist(false);
  };

  const addChecklistItem = async (checklistId) => {
    const text = newItemTexts[checklistId];
    if (!text?.trim()) return;
    const r = await api.post(`/cards/checklists/${checklistId}/items`, { text });
    const updated = {
      ...card,
      checklists: card.checklists.map(cl =>
        cl.id === checklistId ? { ...cl, items: [...cl.items, r.data] } : cl
      )
    };
    onUpdate(updated);
    setNewItemTexts({ ...newItemTexts, [checklistId]: '' });
  };

  const toggleItem = async (itemId, completed) => {
    await api.put(`/cards/checklist-items/${itemId}`, { completed: !completed });
    const updated = {
      ...card,
      checklists: card.checklists.map(cl => ({
        ...cl,
        items: cl.items.map(i => i.id === itemId ? { ...i, completed: !completed } : i)
      }))
    };
    onUpdate(updated);
  };

  const archiveCard = async () => {
    await api.put(`/cards/${card.id}`, { archived: true });
    onClose();
  };

  const LABEL_COLORS = [
    { color: '#1f845a', text: 'Done' },
    { color: '#e2b203', text: 'In Progress' },
    { color: '#c9372c', text: 'Bug' },
    { color: '#0052cc', text: 'Feature' },
    { color: '#8b57d4', text: 'Design' },
    { color: '#e6007a', text: 'Urgent' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-title-wrap">
          {editingTitle ? (
            <input autoFocus className="modal-title-input" value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => e.key === 'Enter' && saveTitle()} />
          ) : (
            <h2 onClick={() => setEditingTitle(true)}>{title}</h2>
          )}
        </div>

        <div className="modal-body">
          <div className="modal-main">
            <div className="modal-section">
              <h4>📝 Description</h4>
              {editingDesc ? (
                <div>
                  <textarea className="desc-input" value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Add a description..." />
                  <div className="desc-actions">
                    <button onClick={saveDesc}>Save</button>
                    <button onClick={() => setEditingDesc(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="desc-text" onClick={() => setEditingDesc(true)}>
                  {description || 'Add a description...'}
                </p>
              )}
            </div>

            {card.checklists?.map(cl => {
              const done = cl.items.filter(i => i.completed).length;
              const total = cl.items.length;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <div key={cl.id} className="modal-section">
                  <h4>✓ {cl.title}</h4>
                  <div className="progress-bar"><div style={{ width: `${pct}%` }} /></div>
                  <p className="progress-text">{pct}%</p>
                  {cl.items.map(item => (
                    <div key={item.id} className="checklist-item">
                      <input type="checkbox" checked={item.completed}
                        onChange={() => toggleItem(item.id, item.completed)} />
                      <span className={item.completed ? 'completed' : ''}>{item.text}</span>
                    </div>
                  ))}
                  <div className="add-item-row">
                    <input placeholder="Add an item..."
                      value={newItemTexts[cl.id] || ''}
                      onChange={e => setNewItemTexts({ ...newItemTexts, [cl.id]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && addChecklistItem(cl.id)} />
                    <button onClick={() => addChecklistItem(cl.id)}>Add</button>
                  </div>
                </div>
              );
            })}

            <div className="modal-section">
              {addingChecklist ? (
                <div className="add-checklist-form">
                  <input autoFocus placeholder="Checklist title..."
                    value={newChecklistTitle}
                    onChange={e => setNewChecklistTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addChecklist()} />
                  <div className="desc-actions">
                    <button onClick={addChecklist}>Add</button>
                    <button onClick={() => setAddingChecklist(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="add-checklist-btn" onClick={() => setAddingChecklist(true)}>
                  + Add Checklist
                </button>
              )}
            </div>
          </div>

          <div className="modal-sidebar">
            <div className="sidebar-section">
              <h5>📅 Due Date</h5>
              <input type="date" value={dueDate}
                onChange={e => saveDueDate(e.target.value)}
                className="date-input" />
            </div>

            <div className="sidebar-section">
              <h5>👤 Members</h5>
              {boardMembers.map(m => {
                const assigned = card.assignments?.some(a => a.member.id === m.id);
                return (
                  <div key={m.id} className={`member-row ${assigned ? 'assigned' : ''}`}
                    onClick={() => toggleMember(m.id)}>
                    <span className="member-avatar" style={{ background: m.color }}>{m.avatar}</span>
                    <span>{m.name}</span>
                    {assigned && <span className="check">✓</span>}
                  </div>
                );
              })}
            </div>

            <div className="sidebar-section">
              <h5>🏷️ Labels</h5>
              <div className="current-labels">
                {card.labels?.map(l => (
                  <span key={l.id} className="label-tag" style={{ background: l.color }}>
                    {l.text} <button onClick={() => removeLabel(l.id)}>✕</button>
                  </span>
                ))}
              </div>
              <div className="label-options">
                {LABEL_COLORS.map(l => (
                  <div key={l.color} className="label-option" style={{ background: l.color }}
                    onClick={() => addLabel(l.color, l.text)}>
                    {l.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <button className="archive-btn" onClick={archiveCard}>🗄 Archive Card</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardModal;