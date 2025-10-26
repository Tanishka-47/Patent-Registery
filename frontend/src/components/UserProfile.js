import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  TextField, 
  Button, 
  Grid, 
  Divider, 
  IconButton, 
  InputAdornment,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const UserProfile = ({ profile, wallet, did, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    bio: '',
    website: '',
    twitter: '',
    linkedin: ''
  });
  const [errors, setErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        organization: profile.organization || '',
        bio: profile.bio || '',
        website: profile.website || '',
        twitter: profile.twitter || '',
        linkedin: profile.linkedin || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onUpdateProfile(formData);
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      organization: profile.organization || '',
      bio: profile.bio || '',
      website: profile.website || '',
      twitter: profile.twitter || '',
      linkedin: profile.linkedin || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">User Profile</Typography>
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <Box>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  margin: '0 auto',
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                  color: 'white'
                }}
              >
                {profile?.name?.charAt(0) || 'U'}
              </Avatar>
            </Box>
            
            <Typography variant="h6" gutterBottom>
              {isEditing ? (
                <TextField
                  fullWidth
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  variant="standard"
                  sx={{ mb: 2 }}
                />
              ) : (
                profile?.name || 'User Name'
              )}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {isEditing ? (
                <TextField
                  fullWidth
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  variant="standard"
                  placeholder="Organization"
                />
              ) : (
                profile?.organization || 'Organization'
              )}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Wallet Address:</Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {wallet || 'Not connected'}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle2" color="text.secondary">DID:</Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {did || 'Not available'}
              </Typography>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Contact Information</Typography>
            <Box sx={{ '& > :not(style)': { mb: 2 } }}>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    size="small"
                  />
                ) : (
                  <Typography variant="body1">{profile?.email || 'No email provided'}</Typography>
                )}
              </div>
              
              <div>
                <Typography variant="subtitle2" color="text.secondary">Website</Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://"
                    size="small"
                  />
                ) : profile?.website ? (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    {profile.website}
                  </a>
                ) : (
                  <Typography variant="body1">No website provided</Typography>
                )}
              </div>
            </Box>
            
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Social Links</Typography>
            <Box sx={{ '& > :not(style)': { mb: 1 } }}>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Twitter</Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="@username"
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">@</InputAdornment>,
                    }}
                  />
                ) : profile?.twitter ? (
                  <a 
                    href={`https://twitter.com/${profile.twitter.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {profile.twitter}
                  </a>
                ) : (
                  <Typography variant="body1">Not provided</Typography>
                )}
              </div>
              
              <div>
                <Typography variant="subtitle2" color="text.secondary">LinkedIn</Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="linkedin.com/in/username"
                    size="small"
                  />
                ) : profile?.linkedin ? (
                  <a 
                    href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {profile.linkedin}
                  </a>
                ) : (
                  <Typography variant="body1">Not provided</Typography>
                )}
              </div>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>About</Typography>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={6}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                variant="outlined"
              />
            ) : (
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {profile?.bio || 'No bio provided'}
              </Typography>
            )}
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>Activity Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="primary">12</Typography>
                    <Typography variant="body2">Patents</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="secondary">5</Typography>
                    <Typography variant="body2">Transfers</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main">3</Typography>
                    <Typography variant="body2">Active Projects</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>Recent Activity</Typography>
              <Box sx={{ '& > :not(style)': { mb: 2 } }}>
                {[1, 2, 3].map((item) => (
                  <Paper key={item} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                        {profile?.name?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          You {['created', 'updated', 'shared'][item % 3]} a patent
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item} day{item !== 1 ? 's' : ''} ago
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ pl: 4 }}>
                      {[
                        'Created a new patent application for "Blockchain-based IP Management"',
                        'Updated the description of "Decentralized Patent Registry"',
                        'Shared "Smart Contract Framework" with 3 team members'
                      ][item % 3]}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile;
