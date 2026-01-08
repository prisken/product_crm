import React from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

function Draggable() {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: 'draggable',
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  
  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes} className="p-4 bg-blue-500 text-white rounded shadow-lg cursor-grab active:cursor-grabbing">
      Drag me
    </button>
  );
}

function Droppable() {
  const {isOver, setNodeRef} = useDroppable({
    id: 'droppable',
  });
  const style = {
    color: isOver ? 'green' : undefined,
    borderColor: isOver ? 'green' : 'black',
    backgroundColor: isOver ? '#e0ffe0' : '#f0f0f0',
  };
  
  return (
    <div ref={setNodeRef} style={style} className="w-64 h-64 border-2 border-dashed flex items-center justify-center transition-colors">
      {isOver ? 'Drop here!' : 'Drop zone'}
    </div>
  );
}

export const DebugWorkspace = () => {
  const [parent, setParent] = React.useState<string | null>(null);
  const draggable = (
    <Draggable />
  );

  return (
    <DndContext 
      onDragEnd={(event) => {
        const {over} = event;
        console.log('DEBUG Drag End:', event);
        setParent(over ? over.id as string : null);
      }}
      onDragStart={(event) => console.log('DEBUG Drag Start:', event)}
      onDragMove={(event) => console.log('DEBUG Drag Move:', event.active.rect.current.translated, event.over)}
    >
      <div className="flex flex-col items-center justify-center h-screen gap-8 p-8 bg-gray-50">
          <h1 className="text-2xl font-bold">Debug Mode</h1>
          <p>Open Console to see events</p>
          
          <div className="flex gap-12">
            <div className="p-8 bg-white rounded shadow">
                <h2 className="mb-4 font-bold">Source</h2>
                {!parent ? draggable : 'Dropped!'}
            </div>

            <Droppable />
          </div>
          
          <div className="p-4 bg-white rounded shadow w-full max-w-md">
             <h3 className="font-bold">Status:</h3>
             <pre className="text-sm">{parent ? `Dropped in ${parent}` : 'Not dropped'}</pre>
          </div>
      </div>
    </DndContext>
  );
};

