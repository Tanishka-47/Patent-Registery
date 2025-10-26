import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  FormGroup, 
  FormControlLabel, 
  Switch, 
  Button, 
  Divider, 
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { 
  DarkMode as DarkModeIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Delete as DeleteIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Help as HelpIcon
} from '@mui/icons-material';

const Settings = ({ darkMode, onToggleDarkMode, onExportData, onImportData }) => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weeklyDigest: true,
    securityAlerts: true,
  });
  
  const [language, setLanguage] = useState('en');
  const [autoSave, setAutoSave] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleNotificationChange = (event) => {
    setNotifications({
      ...notifications,
      [event.target.name]: event.target.checked,
    });
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleAutoSaveChange = (event) => {
    setAutoSave(event.target.checked);
  };

  const handleExport = () => {
    onExportData();
    setSnackbar({
      open: true,
      message: 'Data exported successfully!',
      severity: 'success',
    });
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Process the file here
      onImportData(file);
      setSnackbar({
        open: true,
        message: 'Data imported successfully!',
        severity: 'success',
      });
    }
  };

  const handleDeleteAccount = () => {
    setConfirmDialogOpen(true);
  };

  const confirmDeleteAccount = () => {
    // Handle account deletion
    setConfirmDialogOpen(false);
    setSnackbar({
      open: true,
      message: 'Account deleted successfully',
      severity: 'info',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      
      <Grid container spacing={3}>
        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DarkModeIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Appearance</Typography>
            </Box>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={darkMode} 
                    onChange={onToggleDarkMode} 
                    name="darkMode"
                  />
                }
                label="Dark Mode"
              />
              
              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel id="language-select-label">Language</InputLabel>
                <Select
                  labelId="language-select-label"
                  id="language-select"
                  value={language}
                  label="Language"
                  onChange={handleLanguageChange}
                  startAdornment={<LanguageIcon color="action" sx={{ mr: 1 }} />}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="zh">中文</MenuItem>
                  <MenuItem value="ja">日本語</MenuItem>
                </Select>
              </FormControl>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={autoSave} 
                    onChange={handleAutoSaveChange} 
                    name="autoSave"
                  />
                }
                label="Auto-save changes"
              />
            </FormGroup>
          </Paper>
          
          {/* Notifications */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Notifications</Typography>
            </Box>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifications.email} 
                    onChange={handleNotificationChange} 
                    name="email"
                  />
                }
                label="Email notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifications.push} 
                    onChange={handleNotificationChange} 
                    name="push"
                  />
                }
                label="Push notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifications.weeklyDigest} 
                    onChange={handleNotificationChange} 
                    name="weeklyDigest"
                  />
                }
                label="Weekly digest"
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifications.securityAlerts} 
                    onChange={handleNotificationChange} 
                    name="securityAlerts"
                  />
                }
                label="Security alerts"
              />
            </FormGroup>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          {/* Data Management */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StorageIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Data Management</Typography>
            </Box>
            
            <Box sx={{ '& > *': { mb: 2 } }}>
              <Button
                variant="outlined"
                startIcon={<CloudDownloadIcon />}
                onClick={handleExport}
                fullWidth
              >
                Export All Data
              </Button>
              
              <input
                accept=".json"
                style={{ display: 'none' }}
                id="import-data"
                type="file"
                onChange={handleImport}
              />
              <label htmlFor="import-data">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Import Data
                </Button>
              </label>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Export your data for backup or transfer to another account.
              </Typography>
            </Box>
          </Paper>
          
          {/* Security */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Security</Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Change Password" 
                  secondary="Last changed 3 months ago" 
                />
                <ListItemSecondaryAction>
                  <Button variant="outlined" size="small">
                    Change
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Two-Factor Authentication" 
                  secondary="Add an extra layer of security" 
                />
                <ListItemSecondaryAction>
                  <Switch edge="end" />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Active Sessions" 
                  secondary="2 active sessions" 
                />
                <ListItemSecondaryAction>
                  <Button variant="outlined" size="small">
                    View All
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
          
          {/* Account */}
          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'error.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="error">Danger Zone</Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These actions are irreversible. Please proceed with caution.
            </Typography>
            
            <Box sx={{ '& > *': { mb: 1 } }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteAccount}
                fullWidth
              >
                Delete Account
              </Button>
              
              <Typography variant="caption" color="error">
                Warning: This will permanently delete your account and all associated data.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete your account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action cannot be undone. This will permanently delete your account and all associated data, 
            including patents and transfer history.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteAccount} color="error" autoFocus>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
