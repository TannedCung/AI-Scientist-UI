import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ScienceIcon from '@mui/icons-material/Science';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import Link from 'next/link';
import { researchApi } from '../../utils/api';
import { ResearchIdea, ExperimentRun, CreateExperimentResponse } from '../../types';

export default function ResearchIdeaDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [runningExperiment, setRunningExperiment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [idea, setIdea] = useState<ResearchIdea | null>(null);
  const [experiments, setExperiments] = useState<ExperimentRun[]>([]);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch the research idea
        const ideaData = await researchApi.getIdea(id as string);
        setIdea(ideaData);
        
        // Fetch all experiments to find ones associated with this idea
        const allExperiments = await researchApi.getAllExperiments();
        const relatedExperiments = allExperiments.filter(exp => exp.research_idea_id === id);
        setExperiments(relatedExperiments);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching research idea');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleRunExperiment = async () => {
    if (!id) return;
    
    setRunningExperiment(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await researchApi.runExperiment(id as string);
      setSuccess('Experiment started successfully! You will be redirected to the experiment page shortly.');
      
      // Add the new experiment to our list - convert response to compatible format
      const newExperiment: ExperimentRun = {
        id: response.experiment_id,
        research_idea_id: response.idea_id,
        status: response.status,
        log_folder_path: null,
        html_file_path: null,
        started_at: response.started_at,
        completed_at: null,
        is_successful: null
      };
      
      setExperiments(prev => [newExperiment, ...prev]);
      
      // Redirect to the experiment page after a short delay
      setTimeout(() => {
        router.push(`/experiments/${response.experiment_id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while starting the experiment');
    } finally {
      setRunningExperiment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'info';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading research idea...
        </Typography>
      </Container>
    );
  }

  if (!idea) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Alert severity="error">
            Research idea not found
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Link href="/" passHref>
              <Button startIcon={<ArrowBackIcon />}>
                Back to Home
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Link href="/" passHref>
            <Button startIcon={<ArrowBackIcon />} sx={{ mr: 2 }}>
              Back
            </Button>
          </Link>
          <Typography variant="h4" component="h1">
            Research Idea
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {idea.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Keywords: {idea.keywords}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  TL;DR
                </Typography>
                <Typography variant="body1" paragraph>
                  {idea.tldr}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Abstract
                </Typography>
                <Typography variant="body1">
                  {idea.abstract}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button 
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleRunExperiment}
                  disabled={runningExperiment}
                >
                  {runningExperiment ? <CircularProgress size={24} /> : 'Run Experiment'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Files
                </Typography>
                <Button 
                  startIcon={<CloudDownloadIcon />}
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 1 }}
                  component="a"
                  href={idea.markdown_file_path}
                  target="_blank"
                >
                  Markdown File
                </Button>
                <Button 
                  startIcon={<CloudDownloadIcon />}
                  variant="outlined"
                  fullWidth
                  component="a"
                  href={idea.code_file_path}
                  target="_blank"
                >
                  Code File
                </Button>
              </CardContent>
            </Card>
            
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Related Experiments
                </Typography>
                {experiments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No experiments have been run for this research idea yet.
                  </Typography>
                ) : (
                  experiments.map((experiment) => (
                    <Box 
                      key={experiment.id} 
                      sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <Box>
                        <Typography variant="body2">
                          {experiment.id.substring(0, 8)}...
                        </Typography>
                        <Chip 
                          label={experiment.status} 
                          color={getStatusColor(experiment.status) as any} 
                          size="small" 
                        />
                      </Box>
                      <Link href={`/experiments/${experiment.id}`} passHref>
                        <Button size="small" variant="outlined">
                          View
                        </Button>
                      </Link>
                    </Box>
                  ))
                )}
              </CardContent>
              <CardActions>
                <Link href="/experiments" passHref style={{ width: '100%' }}>
                  <Button 
                    fullWidth
                    startIcon={<ScienceIcon />}
                  >
                    View All Experiments
                  </Button>
                </Link>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
} 