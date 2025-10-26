import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <IconButton 
        onClick={toggleTheme} 
        color="inherit"
        sx={{
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'scale(1.1)'
          },
          width: 40,
          height: 40,
          transition: 'all 0.3s ease',
          marginLeft: 1,
        }}
      >
        {darkMode ? (
          <Brightness7Icon sx={{ color: '#ffb74d' }} />
        ) : (
          <Brightness4Icon sx={{ color: '#2c3e50' }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
