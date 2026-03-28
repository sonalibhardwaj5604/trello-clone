import { createContext, useContext, useState } from 'react';

const DragContext = createContext(null);

export function DragDropContext({ onDragEnd, children }) {
  const [dragging, setDragging] = useState(null);

  const startDrag = (item) => setDragging(item);
  const endDrag = (destination) => {
    if (dragging && destination) {
      onDragEnd({ source: dragging.source, destination, type: dragging.type });
    }
    setDragging(null);
  };

  return (
    <DragContext.Provider value={{ dragging, startDrag, endDrag }}>
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  return useContext(DragContext);
}