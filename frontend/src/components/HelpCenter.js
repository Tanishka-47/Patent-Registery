import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  TextField, 
  Button, 
  Divider, 
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoLibraryIcon,
  ContactSupport as ContactSupportIcon,
  CheckCircle as CheckCircleIcon,
  Book as BookIcon,
  Code as CodeIcon,
  School as SchoolIcon,
  Forum as ForumIcon,
  BugReport as BugReportIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState('panel1');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Help request submitted:', message);
    setSubmitted(true);
    setMessage('');
    
    // Reset submission status after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  const faqs = [
    {
      question: 'How do I register a new patent?',
      answer: 'To register a new patent, navigate to the Dashboard and click on the "Register New Patent" button. Fill in the required details including the patent title, description, and upload any supporting documents.'
    },
    {
      question: 'How can I transfer a patent to another user?',
      answer: 'To transfer a patent, go to the patent details page and click on the "Transfer Patent" button. Enter the recipient\'s wallet address and confirm the transaction.'
    },
    {
      question: 'What file formats are supported for patent documents?',
      answer: 'We support PDF, DOCX, and TXT formats for patent documents. The maximum file size is 10MB per document.'
    },
    {
      question: 'How do I update my profile information?',
      answer: 'Click on your profile picture in the top-right corner and select "Profile" from the dropdown menu. You can update your information and save the changes.'
    },
    {
      question: 'How can I check the status of my patent application?',
      answer: 'The status of your patent application can be viewed in the "My Patents" section of your dashboard. Each patent will display its current status.'
    },
  ];

  const resources = [
    { 
      title: 'Getting Started Guide', 
      icon: <BookIcon color="primary" />, 
      description: 'Learn the basics of our platform',
      tags: ['beginner', 'guide']
    },
    { 
      title: 'Video Tutorials', 
      icon: <VideoLibraryIcon color="primary" />, 
      description: 'Step-by-step video guides',
      tags: ['video', 'tutorial']
    },
    { 
      title: 'API Documentation', 
      icon: <CodeIcon color="primary" />, 
      description: 'Integrate with our API',
      tags: ['developer', 'api']
    },
    { 
      title: 'Best Practices', 
      icon: <LightbulbIcon color="primary" />, 
      description: 'Tips for managing your patents',
      tags: ['tips', 'guide']
    },
  ];

  const filteredFAQs = searchQuery 
    ? faqs.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <Box>
      {/* Hero Section */}
      <Paper 
        sx={{ 
          p: { xs: 3, md: 6 }, 
          mb: 4, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          How can we help you today?
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, maxWidth: 700, mx: 'auto', opacity: 0.9 }}>
          Find answers to your questions in our help center or contact our support team for assistance.
        </Typography>
        
        <Box sx={{ maxWidth: 700, mx: 'auto' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search help articles, FAQs, and more..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              sx: { 
                bgcolor: 'white',
                borderRadius: 2,
                '& fieldset': { border: 'none' },
                '&:hover fieldset': { border: 'none' },
                '&.Mui-focused fieldset': { border: 'none' },
              },
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Popular Articles */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'medium' }}>
              Popular Articles
            </Typography>
            <Grid container spacing={2}>
              {resources.map((resource, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ mr: 1 }}>{resource.icon}</Box>
                        <Typography variant="h6" component="h3">
                          {resource.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {resource.description}
                      </Typography>
                      <Box sx={{ mt: 'auto', pt: 1 }}>
                        {resource.tags.map((tag, i) => (
                          <Chip 
                            key={i} 
                            label={tag} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }} 
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* FAQ Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'medium' }}>
              Frequently Asked Questions
            </Typography>
            
            {filteredFAQs.length > 0 ? (
              <Paper variant="outlined">
                {filteredFAQs.map((faq, index) => (
                  <Accordion 
                    key={index} 
                    expanded={expanded === `panel${index}`} 
                    onChange={handleAccordionChange(`panel${index}`)}
                    elevation={0}
                    sx={{
                      '&:before': {
                        display: 'none',
                      },
                      '&.Mui-expanded': {
                        margin: 0,
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel${index}bh-content`}
                      id={`panel${index}bh-header`}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <Typography sx={{ fontWeight: 'medium' }}>{faq.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography color="text.secondary">
                        {faq.answer}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Button 
                          size="small" 
                          color="primary"
                          startIcon={<ArticleIcon />}
                        >
                          Read more
                        </Button>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Paper>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No results found for "{searchQuery}"</Typography>
                <Button 
                  variant="text" 
                  color="primary" 
                  onClick={() => setSearchQuery('')}
                  sx={{ mt: 1 }}
                >
                  Clear search
                </Button>
              </Paper>
            )}
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Contact Support */}
          <Paper sx={{ p: 3, mb: 3, position: 'sticky', top: 20 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ContactSupportIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Need Help?</Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Can't find what you're looking for? Our support team is here to help.
            </Typography>
            
            {submitted ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" color="success.main" gutterBottom>
                  Message Sent!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We've received your message and will get back to you soon.
                </Typography>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Your Message"
                  multiline
                  rows={4}
                  variant="outlined"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  sx={{ mb: 2 }}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth
                  startIcon={<ForumIcon />}
                >
                  Send Message
                </Button>
              </Box>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <ArticleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Knowledge Base" 
                  secondary="Browse our documentation"
                  secondaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SchoolIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Tutorials" 
                  secondary="Learn with step-by-step guides"
                  secondaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BugReportIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Report a Bug" 
                  secondary="Found an issue? Let us know"
                  secondaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Paper>
          
          {/* Quick Links */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Quick Links</Typography>
            <List dense>
              {[
                'Getting Started',
                'Account Settings',
                'Billing & Subscriptions',
                'API Documentation',
                'System Status',
                'Release Notes'
              ].map((text, index) => (
                <ListItem button key={index}>
                  <ListItemText primary={text} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Bottom CTA */}
      <Paper 
        sx={{ 
          p: 4, 
          mt: 4, 
          textAlign: 'center',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Typography variant="h5" gutterBottom>
          Still need help?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
          Our customer support team is available 24/7 to assist you with any questions or issues you may have.
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          startIcon={<ContactSupportIcon />}
          href="mailto:support@patentregistry.com"
        >
          Contact Support
        </Button>
      </Paper>
    </Box>
  );
};

export default HelpCenter;
