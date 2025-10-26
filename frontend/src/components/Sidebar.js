import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'upload', label: 'Upload Patent', icon: '📤' },
  { key: 'register', label: 'Register Patent', icon: '📝' },
  { key: 'view', label: 'View Patents', icon: '🔍' },
  { key: 'transfer', label: 'Transfer Patent', icon: '🔄' }
];

const MenuItem = ({ item, isActive, onClick }) => {
  return (
    <motion.div
      className="menu-item"
      initial={false}
      animate={{
        backgroundColor: isActive ? 'rgba(57, 64, 106, 0.8)' : 'transparent',
        borderLeft: isActive ? '4px solid #4e8cff' : '4px solid transparent',
        fontWeight: isActive ? 'bold' : 'normal',
      }}
      whileHover={{
        backgroundColor: isActive ? 'rgba(57, 64, 106, 0.9)' : 'rgba(255, 255, 255, 0.05)',
        x: 5,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      style={{
        padding: '14px 20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.span 
        style={{ marginRight: 10, fontSize: '1.2em' }}
        animate={{ scale: isActive ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {item.icon}
      </motion.span>
      {item.label}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="active-indicator"
          style={{
            position: 'absolute',
            right: 10,
            width: 8,
            height: 8,
            background: '#4e8cff',
            borderRadius: '50%',
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30
          }}
        />
      )}
    </motion.div>
  );
};

export default function Sidebar({ current, onNavigate }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Trigger the slide-in animation after component mounts
    setIsMounted(true);
  }, []);

  return (
    <motion.div 
      style={{
        width: 220,
        background: 'linear-gradient(180deg, #1a1e3a 0%, #22263d 100%)',
        minHeight: '100vh',
        color: '#fff',
        padding: '30px 0',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}
      initial={{ x: -250, opacity: 0 }}
      animate={{ 
        x: isMounted ? 0 : -250, 
        opacity: isMounted ? 1 : 0,
        transition: { 
          type: 'spring', 
          stiffness: 100, 
          damping: 20,
          delay: 0.2
        }
      }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent, #4e8cff, transparent)',
        opacity: 0.3
      }} />

      <motion.h2 
        style={{
          textAlign: 'center', 
          fontSize: 20, 
          marginBottom: 40,
          padding: '0 20px',
          position: 'relative',
          display: 'inline-block'
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span style={{ position: 'relative', zIndex: 1 }}>Patent Registry</span>
        <motion.span 
          style={{
            position: 'absolute',
            bottom: -5,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 40,
            height: 3,
            background: '#4e8cff',
            borderRadius: 3
          }}
          initial={{ width: 0 }}
          animate={{ width: 40 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
        />
      </motion.h2>

      <div style={{ padding: '0 10px' }}>
        {menuItems.map((item) => (
          <MenuItem
            key={item.key}
            item={item}
            isActive={current === item.key}
            onClick={() => onNavigate(item.key)}
            onHoverStart={() => setHoveredItem(item.key)}
            onHoverEnd={() => setHoveredItem(null)}
          />
        ))}
      </div>

      <motion.div 
        className="hover-bg"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'rgba(78, 140, 255, 0.1)',
          borderRadius: 8,
          zIndex: 0,
        }}
        animate={{
          y: hoveredItem ? menuItems.findIndex(item => item.key === hoveredItem) * 60 : 0,
          opacity: hoveredItem ? 1 : 0
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
    </motion.div>
  );
}
