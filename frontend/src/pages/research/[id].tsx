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

        {idea && (
          <>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom>
                    {idea.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip 
                      label={idea.status.toUpperCase()} 
                      color={getStatusColor(idea.status)}
                      size="small"
                    />
                    {idea.error_message && (
                      <Chip 
                        label="Error" 
                        color="error"
                        size="small"
                        onClick={() => setError(idea.error_message)}
                      />
                    )}
                  </Box>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Keywords: {idea.keywords}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>TL;DR:</strong> {idea.tldr}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Abstract:</strong> {idea.abstract}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {formatDate(idea.created_at)}
                  </Typography>
                  {idea.updated_at && (
                    <Typography variant="body2" color="text.secondary">
                      Last Updated: {formatDate(idea.updated_at)}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>

            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ScienceIcon />}
                onClick={handleRunExperiment}
                disabled={runningExperiment || idea.status === 'generating'}
                sx={{ mr: 2 }}
              >
                {runningExperiment ? 'Starting Experiment...' : 'Run Experiment'}
              </Button>
              {idea.ideas_json_url && (
                <Button
                  variant="outlined"
                  startIcon={<CloudDownloadIcon />}
                  href={idea.ideas_json_url}
                  target="_blank"
                  sx={{ mr: 2 }}
                >
                  Download Ideas
                </Button>
              )}
            </Box>

            {experiments.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Experiments
                </Typography>
                <Grid container spacing={2}>
                  {experiments.map((experiment) => (
                    <Grid item xs={12} key={experiment.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6">
                              Experiment {experiment.id}
                            </Typography>
                            <Chip 
                              label={experiment.status.toUpperCase()} 
                              color={getStatusColor(experiment.status)}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Started: {formatDate(experiment.started_at)}
                          </Typography>
                          {experiment.completed_at && (
                            <Typography variant="body2" color="text.secondary">
                              Completed: {formatDate(experiment.completed_at)}
                            </Typography>
                          )}
                          {experiment.error_message && (
                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                              Error: {experiment.error_message}
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            component={Link}
                            href={`/experiments/${experiment.id}`}
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </>
        )}
      </Box>
    </Container>
  );
} 