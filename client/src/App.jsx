import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import TaskCard from './components/TaskCard';
import { useTasks } from './hooks/useTasks';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

const Dashboard = () => {
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
          <h1 style={{ margin: 0 }}>Your Tasks</h1>
          <p style={{ color: 'var(--text)' }}>You have {tasks.filter(t => t.status !== 'done').length} pending tasks.</p>
        </div>
        <button style={{
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          + New Task
        </button>
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

function App() {
  return (
    <BrowserRouter>
      {/* Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg)',
            color: 'var(--text-h)',
            border: '1px solid var(--border)',
          }
        }} 
      />
      
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
