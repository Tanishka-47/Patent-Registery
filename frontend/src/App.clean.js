import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Snackbar, Alert } from '@mui/material';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import MetaMaskConnect from './MetaMaskConnect';
import DIDLogin from './DIDLogin';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PatentUpload from './PatentUpload';
import TransferPatent from './components/TransferPatent';
import AuditTrail from './components/AuditTrail';
import PatentDetails from './components/PatentDetails';
import UserProfile from './components/UserProfile';
import Settings from './components/Settings';
import HelpCenter from './components/HelpCenter';
import LoadingSpinner from './components/LoadingSpinner';
import { registerPatent, fetchPatents } from './PatentRegistryInterface';
import { BrowserProvider } from 'ethers';
import './BlockchainTheme.css';

// Theme configuration
const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#00f5ff' : '#1976d2',
    },
    secondary: {
      main: mode === 'dark' ? '#7b2cbf' : '#9c27b0',
    },
    background: {
      default: mode === 'dark' ? '#0a0e27' : '#f5f5f5',
      paper: mode === 'dark' ? '#141b3d' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
      secondary: mode === 'dark' ? '#b8c5e0' : 'rgba(0, 0, 0, 0.6)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          transition: 'background-color 0.3s ease, color 0.3s ease',
        },
      },
    },
  },
});

function AppContent() {
  const { darkMode } = useTheme();
  const theme = useMemo(() => getTheme(darkMode ? 'dark' : 'light'), [darkMode]);
  
  const [page, setPage] = useState('dashboard');
  const [ipfsHash, setIpfsHash] = useState('');
  const [wallet, setWallet] = useState('');
  const [signer, setSigner] = useState(null);
  const [did, setDID] = useState('');
  const [patents, setPatents] = useState([]);
  const [loadingPatents, setLoadingPatents] = useState(false);
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [transferRequests, setTransferRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Handle wallet connection
  const handleWallet = (walletAddress, signerInstance) => {
    setWallet(walletAddress);
    setSigner(signerInstance);
  };

  // Handle DID connection
  const handleDID = (did) => {
    setDID(did);
  };

  // Load patents
  const loadPatents = async () => {
    if (!signer) return;
    
    try {
      setLoadingPatents(true);
      const patents = await fetchPatents(signer);
      setPatents(patents);
    } catch (error) {
      console.error('Error loading patents:', error);
      setSnackbar({ open: true, message: 'Failed to load patents', severity: 'error' });
    } finally {
      setLoadingPatents(false);
    }
  };

  // Load data on mount and when signer changes
  useEffect(() => {
    if (signer) {
      loadPatents();
    }
  }, [signer]);

  // Handle patent registration
  const handleRegister = async (title, inventor) => {
    if (!signer || !ipfsHash) return;
    
    try {
      setLoadingPatents(true);
      await registerPatent(signer, title, inventor, ipfsHash, '');
      setSnackbar({ open: true, message: 'Patent registered successfully!', severity: 'success' });
      await loadPatents();
      setPage('dashboard');
    } catch (error) {
      console.error('Error registering patent:', error);
      setSnackbar({ open: true, message: 'Failed to register patent', severity: 'error' });
    } finally {
      setLoadingPatents(false);
    }
  };

  // Handle patent transfer
  const handleTransfer = async (patentId, newOwner) => {
    // Implementation for patent transfer
    console.log(`Transferring patent ${patentId} to ${newOwner}`);
    setSnackbar({ open: true, message: 'Transfer request sent', severity: 'info' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <div className={darkMode ? 'dark-theme' : 'light-theme'} style={{
        display: 'flex',
        minHeight: '100vh',
        background: darkMode
          ? 'radial-gradient(ellipse at top left, rgba(0, 245, 255, 0.15) 0%, transparent 50%), \
             radial-gradient(ellipse at top right, rgba(123, 44, 191, 0.15) 0%, transparent 50%), \
             linear-gradient(135deg, #0a0e27 0%, #141b3d 50%, #0d1128 100%)'
          : 'radial-gradient(ellipse at top left, rgba(0, 150, 255, 0.1) 0%, transparent 50%), \
             radial-gradient(ellipse at top right, rgba(200, 100, 255, 0.1) 0%, transparent 50%), \
             linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
        backgroundAttachment: 'fixed',
        color: 'var(--color-text)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        {/* Decorative elements */}
        <div className="blockchain-connections"></div>
        <div className="patent-texture"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="blockchain-node"></div>
        ))}
        
        <Sidebar current={page} onNavigate={setPage} />
        <div style={{ flex: 1, padding: 0, minHeight: '100vh' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, padding: 20 }}>
            <MetaMaskConnect onWallet={handleWallet} />
            <DIDLogin onDID={handleDID} />
            <ThemeToggle />
          </div>
          
          {/* Main content */}
          <div style={{ padding: '20px' }}>
            {loadingPatents ? (
              <LoadingSpinner show={true} text="Loading..." />
            ) : (
              <>
                {page === 'dashboard' && <Dashboard user={wallet} patents={patents} />}
                {page === 'upload' && <PatentUpload onIpfsHash={setIpfsHash} />}
                {page === 'transfer' && <TransferPatent patents={patents} onTransfer={handleTransfer} />}
                {page === 'audit' && <AuditTrail logs={auditLogs} />}
                {page === 'profile' && <UserProfile user={{ wallet, did }} />}
                {page === 'settings' && <Settings />}
                {page === 'help' && <HelpCenter />}
              </>
            )}
          </div>
        </div>
      </div>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MuiThemeProvider>
  );
}

// Main App component with ThemeProvider
const App = () => (
  <ThemeProvider>
    <CssBaseline />
    <AppContent />
  </ThemeProvider>
);

export default App;
