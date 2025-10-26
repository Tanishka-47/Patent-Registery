import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/decorativeElements.css';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Snackbar, Alert, Box, TextField, Button, Typography, List, ListItem, ListItemText, Link } from '@mui/material';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import MetaMaskConnect from './MetaMaskConnect';
import DIDLogin from './DIDLogin';
import PatentUpload from './PatentUpload';
import { registerPatent, fetchPatents } from './PatentRegistryInterface';
import { BrowserProvider } from 'ethers';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TransferPatent from './components/TransferPatent';
import TransferRequests from './components/TransferRequests';
import AuditTrail from './components/AuditTrail';
import PatentDetails from './components/PatentDetails';
import LoadingSpinner from './components/LoadingSpinner';
import UserProfile from './components/UserProfile';
import Settings from './components/Settings';
import HelpCenter from './components/HelpCenter';
import PatentSearchBar from './components/PatentSearchBar';
import PatentFilterBar from './components/PatentFilterBar';
import './BlockchainTheme.css';

// Theme configuration
const getTheme = (mode) => {
  const isLight = mode === 'light';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: isLight ? '#2c3e50' : '#00f5ff',
        light: isLight ? '#4b6584' : '#4df7ff',
        dark: isLight ? '#1e2a38' : '#00b3b8',
        contrastText: isLight ? '#ffffff' : '#000000',
      },
      secondary: {
        main: isLight ? '#a77c4d' : '#7b2cbf',
        light: isLight ? '#c8a97e' : '#a45dd9',
        dark: isLight ? '#8a5a2a' : '#561e87',
      },
      background: {
        default: isLight ? '#f8f9fa' : '#0a0e27',
        paper: isLight ? '#ffffff' : '#141b3d',
      },
      text: {
        primary: isLight ? '#2c3e50' : '#ffffff',
        secondary: isLight ? '#7f8c8d' : '#b8c5e0',
      },
      divider: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
    },
    typography: {
      fontFamily: '\'Playfair Display\', \'Inter\', \'Roboto\', \'Helvetica\', \'Arial\', sans-serif',
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.5px',
      },
      h2: {
        fontWeight: 600,
        letterSpacing: '-0.5px',
      },
      h3: {
        fontWeight: 600,
        letterSpacing: '-0.5px',
      },
      h4: {
        fontWeight: 600,
        letterSpacing: '-0.25px',
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            padding: '8px 22px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: isLight ? '0 4px 12px rgba(44, 62, 80, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: isLight ? '0 4px 12px rgba(44, 62, 80, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isLight 
              ? '0 4px 20px 0 rgba(0,0,0,0.05), 0 1px 3px 0 rgba(0,0,0,0.1)' 
              : '0 4px 20px 0 rgba(0,0,0,0.2), 0 1px 3px 0 rgba(0,0,0,0.3)',
            border: isLight ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.08)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: isLight ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
  });
};

function AppContent() {
  const { darkMode } = useTheme();
  const theme = useMemo(() => getTheme(darkMode ? 'dark' : 'light'), [darkMode]);
  
  const [page, setPage] = useState('dashboard');
  const [ipfsHash, setIpfsHash] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [wallet, setWallet] = useState('');
  const [signer, setSigner] = useState(null);
  const [did, setDID] = useState('');
  const [patents, setPatents] = useState([]);
  const [loadingPatents, setLoadingPatents] = useState(false);
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [showSpinner, setShowSpinner] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const [transferRequests, setTransferRequests] = useState([
    {
      patentId: 1,
      patentTitle: 'Demo Patent',
      from: '0x1234...abcd',
      to: wallet,
      status: 'pending',
      txHash: '',
      blockNumber: ''
    },
    {
      patentId: 2,
      patentTitle: 'My Patent',
      from: wallet,
      to: '0xabcd...1234',
      status: 'pending',
      txHash: '',
      blockNumber: ''
    }
  ]);

  // Demo approve/reject handlers
  const handleApproveTransfer = (req) => {
    setTransferRequests(trs => trs.map(r => 
      (r.patentId === req.patentId && r.to === req.to) 
        ? { ...r, status: 'approved', txHash: '0xmocktxhash', blockNumber: '12345' } 
        : r
    ));
  };

  const handleRejectTransfer = (req) => {
    setTransferRequests(trs => trs.map(r => 
      (r.patentId === req.patentId && r.to === req.to) 
        ? { ...r, status: 'rejected' } 
        : r
    ));
  };

  // Fetch all patents on load or when page changes to view/dashboard
  useEffect(() => {
    if (page === 'view' || page === 'dashboard' || page === 'transfer') {
      setLoadingPatents(true);
      const fetchAll = async () => {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const p = await fetchPatents(provider);
          setPatents(p);
        } catch (e) {
          setPatents([]);
        }
        setLoadingPatents(false);
      };
      fetchAll();
    }
  }, [page]);

  const handleWallet = async (account) => {
    setWallet(account);
    const provider = new BrowserProvider(window.ethereum);
    setSigner(await provider.getSigner());
  };

  const handleDID = (didValue) => {
    setDID(didValue);
  };

  // Patent registration handler
  const handleRegister = async (title, inventor) => {
    if (!signer) {
      setSnackbar({
        open: true,
        message: 'Please connect MetaMask.',
        severity: 'error'
      });
      return;
    }
    
    try {
      setShowSpinner(true);
      await registerPatent(title, inventor, ipfsHash, signer);
      setSnackbar({
        open: true,
        message: 'Patent registered successfully!',
        severity: 'success'
      });
      setPage('dashboard');
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error registering patent: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setShowSpinner(false);
    }
  };

  // Patent transfer handler
  const handleTransfer = async (patentId, newOwner) => {
    setSnackbar({
      open: true,
      message: `Transfer requested for Patent #${patentId} to ${newOwner}`,
      severity: 'info'
    });
  };

  // Search/filter logic
  const filteredPatents = useMemo(() => {
    return patents.filter(p => {
      let match = true;
      if (search && !(p.title?.toLowerCase().includes(search.toLowerCase()) || 
                     p.inventor?.toLowerCase().includes(search.toLowerCase()) || 
                     p.owner?.toLowerCase().includes(search.toLowerCase()))) {
        match = false;
      }
      if (filters.title && !p.title?.toLowerCase().includes(filters.title.toLowerCase())) match = false;
      if (filters.inventor && !p.inventor?.toLowerCase().includes(filters.inventor.toLowerCase())) match = false;
      if (filters.owner && !p.owner?.toLowerCase().includes(filters.owner.toLowerCase())) match = false;
      if (filters.applicationNumber && p.applicationNumber !== filters.applicationNumber) match = false;
      if (filters.status && p.status !== filters.status) match = false;
      return match;
    });
  }, [patents, search, filters]);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          background: (theme) => {
            if (theme.palette.mode === 'dark') {
              return [
                'radial-gradient(ellipse at top left, rgba(0, 245, 255, 0.15) 0%, transparent 50%)',
                'radial-gradient(ellipse at top right, rgba(123, 44, 191, 0.15) 0%, transparent 50%)',
                'radial-gradient(ellipse at bottom left, rgba(255, 0, 110, 0.12) 0%, transparent 50%)',
                'radial-gradient(ellipse at bottom right, rgba(6, 255, 165, 0.12) 0%, transparent 50%)',
                'linear-gradient(135deg, #0a0e27 0%, #141b3d 50%, #0d1128 100%)'
              ].join(',');
            }
            // Combine gradients and image with proper syntax
            return `
              linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 50%, #e8e8e8 100%),
              radial-gradient(ellipse at top left, rgba(44, 62, 80, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at top right, rgba(167, 124, 77, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at bottom left, rgba(44, 62, 80, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at bottom right, rgba(167, 124, 77, 0.15) 0%, transparent 50%),
              url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29-22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%232c3e50' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")
            `;
          },
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          backgroundBlendMode: 'overlay',
          color: 'text.primary',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'inherit'
        }}
      >
        {/* Enhanced Decorative Elements */}
        <div className="blockchain-connections">
          {[...Array(3)].map((_, i) => (
            <div key={`connection-${i}`} className="connection-line" />
          ))}
        </div>
        
        <div className="patent-texture" />
        
        {/* Animated Blockchain Nodes */}
        <div className="blockchain-nodes">
          {[...Array(8)].map((_, i) => (
            <div key={`node-${i}`} className="blockchain-node" />
          ))}
        </div>
        
        {/* Floating Patent Icons */}
        <div className="floating-patents">
          {[...Array(5)].map((_, i) => (
            <div key={`patent-${i}`} className="patent-icon">
              <div className="patent-document" />
              <div className="patent-ribbon" />
            </div>
          ))}
        </div>
        
        {/* Decorative Grid Overlay */}
        <div className="grid-overlay" />
        
        {/* Subtle Animated Particles */}
        <div className="particles">
          {[...Array(30)].map((_, i) => (
            <div key={`particle-${i}`} className="particle" />
          ))}
        </div>
        
        <Sidebar current={page} onNavigate={setPage} />
        
        <Box sx={{ flex: 1, p: 0, minHeight: '100vh' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 2, 
            p: 2,
            backgroundColor: 'background.paper',
            boxShadow: 1
          }}>
            <MetaMaskConnect onWallet={handleWallet} />
            <DIDLogin onDID={handleDID} />
            <ThemeToggle />
          </Box>

          <Box sx={{ 
            p: 3,
            background: darkMode ? 'none' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: darkMode ? 'none' : 'blur(10px)',
            borderRadius: 2,
            mx: 2,
            my: 2,
            boxShadow: darkMode ? 'none' : '0 4px 30px rgba(0, 0, 0, 0.05)',
            border: darkMode ? 'none' : '1px solid rgba(255, 255, 255, 0.5)'
          }}>
            <LoadingSpinner 
              show={showSpinner || loadingPatents} 
              text={showSpinner ? 'Processing...' : 'Loading patents...'} 
            />
            
            {page === 'dashboard' && (
              <>
                <Dashboard user={wallet} patents={patents} />
                <TransferRequests
                  requests={transferRequests.filter(r => 
                    r.status === 'pending' && 
                    (r.to?.toLowerCase() === wallet?.toLowerCase() || 
                     r.from?.toLowerCase() === wallet?.toLowerCase())
                  )}
                  user={wallet}
                  onApprove={handleApproveTransfer}
                  onReject={handleRejectTransfer}
                />
              </>
            )}

            {page === 'upload' && (
              <Box sx={{ mt: 2 }}>
                <PatentUpload onIpfsHash={(hash, key) => {
                  setIpfsHash(hash);
                  setEncryptionKey(key);
                  setPage('register');
                }} />
              </Box>
            )}

            {page === 'register' && (
              <Box sx={{ 
                mt: 2, 
                p: 3, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                boxShadow: 1
              }}>
                <Typography variant="h5" gutterBottom>
                  Register Patent through Blockchain
                </Typography>
                <Box component="form" onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  await handleRegister(
                    formData.get('title'),
                    formData.get('inventor')
                  );
                }} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    required
                    fullWidth
                    name="title"
                    label="Patent Title"
                    variant="outlined"
                    margin="normal"
                  />
                  <TextField
                    required
                    fullWidth
                    name="inventor"
                    label="Inventor Name"
                    variant="outlined"
                    margin="normal"
                  />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      IPFS Hash:
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      fontFamily: 'monospace', 
                      wordBreak: 'break-all',
                      p: 1,
                      bgcolor: 'action.hover',
                      borderRadius: 1
                    }}>
                      {ipfsHash || 'Please upload a file first'}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Encryption Key:
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      fontFamily: 'monospace', 
                      wordBreak: 'break-all',
                      p: 1,
                      bgcolor: 'action.hover',
                      borderRadius: 1
                    }}>
                      {encryptionKey || 'N/A'}
                    </Typography>
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!ipfsHash}
                    sx={{ mt: 2 }}
                  >
                    Register Patent
                  </Button>
                </Box>
              </Box>
            )}

            {page === 'view' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h5" gutterBottom>
                  View Registered Patents
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <PatentSearchBar 
                    value={search} 
                    onChange={setSearch} 
                    onSearch={() => {}} 
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <PatentFilterBar 
                    filters={filters} 
                    onChange={setFilters} 
                    onReset={() => setFilters({})} 
                  />
                </Box>

                {filteredPatents.length === 0 ? (
                  <Typography>No patents found.</Typography>
                ) : (
                  <List sx={{ 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1,
                    maxHeight: 400,
                    overflow: 'auto'
                  }}>
                    {filteredPatents.map(patent => (
                      <ListItem 
                        key={patent.id} 
                        button 
                        onClick={() => {
                          setSelectedPatent(patent); 
                          setPage('details');
                        }}
                        sx={{ 
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1">
                              <strong>#{patent.id}:</strong> {patent.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" display="block">
                                <strong>Inventor:</strong> {patent.inventor}
                              </Typography>
                              <Typography component="span" variant="body2" display="block">
                                <strong>Owner:</strong> {patent.owner}
                              </Typography>
                              <Typography component="span" variant="body2" display="block">
                                <strong>Status:</strong> {patent.status || 'Pending'}
                              </Typography>
                              {patent.txHash && (
                                <Typography component="span" variant="body2" display="block">
                                  <strong>Tx Hash: </strong>
                                  <Link 
                                    href={`https://etherscan.io/tx/${patent.txHash}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {patent.txHash}
                                  </Link>
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {page === 'details' && selectedPatent && (
              <Box sx={{ mt: 2 }}>
                <Button 
                  startIcon={<ArrowBack />} 
                  onClick={() => setPage('view')}
                  sx={{ mb: 2 }}
                >
                  Back to List
                </Button>
                <PatentDetails 
                  patent={selectedPatent} 
                  onBack={() => setPage('view')} 
                />
              </Box>
            )}

            {page === 'transfer' && (
              <Box sx={{ mt: 2 }}>
                <TransferPatent 
                  patents={patents} 
                  onTransfer={handleTransfer} 
                />
              </Box>
            )}

            {page === 'audit' && (
              <Box sx={{ mt: 2 }}>
                <AuditTrail logs={auditLogs} />
              </Box>
            )}
          </Box>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
      </Box>
    </MuiThemeProvider>
  );
}

// Main App component with ThemeProvider
const App = () => (
  <ThemeProvider>
    <Router>
      <AppContent />
    </Router>
  </ThemeProvider>
);

export default App;