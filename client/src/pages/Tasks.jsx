import React from 'react';
import TaskCard from '../components/TaskCard';
import { useTasks } from '../hooks/useTasks';

const Tasks = () => {
  const { tasks, isLoading, error, updateTask } = useTasks();

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading tasks...</div>;
  }

  if (error) {
    return <div style={{ padding: '40px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0 }}>All Tasks</h1>
          <p style={{ color: 'var(--text)' }}>Manage your complete task list here.</p>
        </div>
      </header>

      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--social-bg)', borderRadius: '12px' }}>
          No tasks found. Create one to get started!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onToggleStatus={(id, newStatus) => updateTask(id, { status: newStatus })} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
