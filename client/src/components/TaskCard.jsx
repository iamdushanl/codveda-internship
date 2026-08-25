import React from 'react';
import { FiCalendar, FiCheckCircle } from 'react-icons/fi';
import { format } from 'date-fns';

const TaskCard = ({ task, onToggleStatus }) => {
  const isDone = task.status === 'done';

  return (
    <div style={{
      background: 'var(--code-bg)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: 'var(--shadow)',
      position: 'relative',
      transition: 'transform 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ 
          fontSize: '1.2rem', 
          fontWeight: '600', 
          margin: 0,
          color: isDone ? 'var(--text)' : 'var(--text-h)',
          textDecoration: isDone ? 'line-through' : 'none'
        }}>
          {task.title}
        </h3>
        
        {/* Toggle Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevents clicking the card if we add a card click handler later
            onToggleStatus(task.id, isDone ? 'todo' : 'done');
          }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: isDone ? 'var(--accent)' : 'var(--text)',
            fontSize: '1.5rem',
            padding: 0,
            display: 'flex'
          }}
          title={isDone ? "Mark as Todo" : "Mark as Done"}
        >
          <FiCheckCircle />
        </button>
      </div>

      {task.description && (
        <p style={{ 
          fontSize: '0.95rem', 
          color: 'var(--text)', 
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {task.description}
        </p>
      )}

      {/* Footer area with Date and Status */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '8px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border)',
        fontSize: '0.85rem'
      }}>
        
        {/* Simple inline status badge */}
        <span style={{
          background: isDone ? 'var(--accent-bg)' : 'var(--social-bg)',
          color: isDone ? 'var(--accent)' : 'var(--text)',
          padding: '4px 10px',
          borderRadius: '12px',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {task.status.replace('-', ' ')}
        </span>

        {task.dueDate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)' }}>
            <FiCalendar />
            {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
