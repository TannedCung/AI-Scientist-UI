import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Chip,
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { ideasApi, experimentsApi } from '../../services/api';
import { useSnackbar } from 'notistack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ScienceIcon from '@mui/icons-material/Science';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import { ResearchIdea, ExperimentRun } from '../../types/models';
import StatusBadge from '../../components/common/StatusBadge';
import Link from 'next/link';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`idea-tabpanel-${index}`}
      aria-labelledby={`idea-tab-${index}`}
      {...other}
      style={{ paddingTop: '20px' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function IdeaDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { enqueueSnackbar } = useSnackbar();
  
  const [idea, setIdea] = useState<ResearchIdea | null>(null);
  const [experiments, setExperiments] = useState<ExperimentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [experimentLoading, setExperimentLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  
  const fetchIdeaDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const ideaData = await ideasApi.getIdea(id as string);
      setIdea(ideaData);
      
      // Fetch experiments for this idea
      const experimentsData = await experimentsApi.getExperiments();
      const relatedExperiments = experimentsData.filter(
        (exp) => exp.research_idea_id === id
      );
      setExperiments(relatedExperiments);
    } catch (error) {
      console.error('Error fetching idea details:', error);
      enqueueSnackbar('Failed to load research idea details', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (id) {
      fetchIdeaDetails();
    }
  }, [id]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleGenerateIdeas = async () => {
    if (!id) return;
    
    setExperimentLoading(true);
    setOpenGenerateDialog(false);
    
    try {
      await ideasApi.generateIdeas(id as string);
      enqueueSnackbar('Generation process started successfully!', { variant: 'success' });
      
      // Refresh the idea to get updated status
      fetchIdeaDetails();
    } catch (error) {
      console.error('Error generating ideas:', error);
      enqueueSnackbar('Failed to start generation process', { variant: 'error' });
    } finally {
      setExperimentLoading(false);
    }
  };
  
  const handleRunExperiment = async () => {
    if (!id) return;
    
    setExperimentLoading(true);
    
    try {
      const response = await experimentsApi.createExperiment(id as string);
      enqueueSnackbar('Experiment started successfully!', { variant: 'success' });
      
      // Add new experiment to the list
      setExperiments([...experiments, response]);
    } catch (error) {
      console.error('Error starting experiment:', error);
      enqueueSnackbar('Failed to start experiment', { variant: 'error' });
    } finally {
      setExperimentLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!idea) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Research idea not found
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => router.push('/ideas')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Ideas
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header with Back Button and Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          sx={{ mr: 1 }} 
          onClick={() => router.push('/ideas')}
          aria-label="Back to ideas"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {idea.title}
        </Typography>
        <StatusBadge status={idea.status || 'draft'} />
      </Box>
      
      {/* Idea Summary Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
            {idea.tldr}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {idea.keywords.split(',').map((keyword, index) => (
              <Chip 
                key={index} 
                label={keyword.trim()} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            ))}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Abstract
          </Typography>
          <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
            {idea.abstract}
          </Typography>
        </CardContent>
      </Card>
      
      {/* Tabs for Resources and Experiments */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="idea details tabs"
          >
            <Tab 
              icon={<DescriptionIcon fontSize="small" />} 
              iconPosition="start" 
              label="Resources" 
              id="idea-tab-0"
              aria-controls="idea-tabpanel-0" 
            />
            <Tab 
              icon={<ScienceIcon fontSize="small" />} 
              iconPosition="start" 
              label={`Experiments (${experiments.length})`} 
              id="idea-tab-1"
              aria-controls="idea-tabpanel-1" 
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Generated Resources
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={idea.status === 'draft' ? <ScienceIcon /> : <AddIcon />}
                onClick={() => idea.status === 'draft' ? setOpenGenerateDialog(true) : handleRunExperiment()}
                disabled={experimentLoading || (idea.status !== 'draft' && idea.status !== 'generated')}
              >
                {idea.status === 'draft' ? 'Generate Ideas' : 'Run Experiment'}
              </Button>
            </Box>
            
            {idea.status === 'draft' && (
              <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                You need to generate ideas first before resources will be available.
              </Typography>
            )}
            
            {idea.status === 'generating' && (
              <Box sx={{ display: 'flex', alignItems: 'center', my: 4 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography>
                  Generating ideas and resources... This may take a few minutes.
                </Typography>
              </Box>
            )}
            
            {idea.status === 'generated' && idea.markdown_url && (
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  AI-Generated Research Document
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<DescriptionIcon />}
                  component="a"
                  href={idea.markdown_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Research Document
                </Button>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  The research document contains AI-generated experiments and code suggestions for your research idea.
                </Typography>
              </Box>
            )}
            
            {idea.status === 'failed' && (
              <Typography variant="body2" color="error" sx={{ my: 2 }}>
                Generation failed. Please try again or modify your research idea.
              </Typography>
            )}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Experiments
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleRunExperiment}
                disabled={experimentLoading || idea.status !== 'generated'}
              >
                Run New Experiment
              </Button>
            </Box>
            
            {idea.status !== 'generated' && (
              <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                You need to generate ideas first before running experiments.
              </Typography>
            )}
            
            {experiments.length === 0 && idea.status === 'generated' ? (
              <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                No experiments have been run yet. Start a new experiment to see results here.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {experiments.map((experiment) => (
                  <Grid item xs={12} key={experiment.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1">
                            Experiment #{experiment.id.slice(-6)}
                          </Typography>
                          <StatusBadge status={experiment.status || 'pending'} />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Started: {new Date(experiment.created_at).toLocaleString()}
                        </Typography>
                        
                        {experiment.completed_at && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Completed: {new Date(experiment.completed_at).toLocaleString()}
                          </Typography>
                        )}
                        
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button 
                            variant="outlined" 
                            size="small"
                            component={Link}
                            href={`/experiments/${experiment.id}`}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Generate Ideas Confirmation Dialog */}
      <Dialog
        open={openGenerateDialog}
        onClose={() => setOpenGenerateDialog(false)}
        aria-labelledby="generate-dialog-title"
      >
        <DialogTitle id="generate-dialog-title">
          Generate Research Ideas
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will start the AI process to generate research hypotheses and experiments based on your idea. This process typically takes a few minutes to complete.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGenerateDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateIdeas} 
            variant="contained" 
            color="primary"
            startIcon={<ScienceIcon />}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 