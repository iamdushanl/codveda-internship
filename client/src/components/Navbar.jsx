import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckSquare, FiUser } from 'react-icons/fi';

const Navbar = () => {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      boxShadow: 'var(--shadow)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        textDecoration: 'none',
        color: 'var(--text-h)'
      }}>
        <FiCheckSquare size={28} color="var(--accent)" />
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'var(--heading)' }}>
          TaskFlow
        </span>
      </Link>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <Link to="/" style={{
          textDecoration: 'none',
          color: 'var(--text)',
          fontWeight: '500',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--text)'}
        >
          Dashboard
        </Link>
        <Link to="/tasks" style={{
          textDecoration: 'none',
          color: 'var(--text)',
          fontWeight: '500',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--text)'}
        >
          Tasks
        </Link>
      </div>

      {/* User Profile / Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button style={{
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: 'var(--sans)',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '0.9'}
        onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          Login
        </button>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'var(--accent-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)',
          border: '1px solid var(--accent-border)',
          cursor: 'pointer'
        }}>
          <FiUser size={20} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
