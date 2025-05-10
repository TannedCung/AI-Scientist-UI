import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardActionArea,
  Button, 
  Divider,
  CircularProgress,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import { ideasApi, experimentsApi } from '../services/api';
import { ResearchIdea, ExperimentRun } from '../types/models';
import StatusBadge from '../components/common/StatusBadge';
import { useSnackbar } from 'notistack';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import ScienceIcon from '@mui/icons-material/Science';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderRadius: 12,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
}));

export default function Dashboard() {
  const [recentIdeas, setRecentIdeas] = useState<ResearchIdea[]>([]);
  const [stats, setStats] = useState({
    totalIdeas: 0,
    totalExperiments: 0,
    completedExperiments: 0,
    failedExperiments: 0,
    runningExperiments: 0,
  });
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch ideas
        const ideas = await ideasApi.getAllIdeas();
        setRecentIdeas(ideas.slice(0, 5)); // Get most recent 5 ideas
        
        // Fetch experiments
        const experiments = await experimentsApi.getExperiments();
        
        // Calculate stats
        const completedExperiments = experiments.filter(exp => exp.status === 'completed');
        const failedExperiments = experiments.filter(exp => exp.status === 'failed');
        const runningExperiments = experiments.filter(exp => ['pending', 'running'].includes(exp.status));
        
        setStats({
          totalIdeas: ideas.length,
          totalExperiments: experiments.length,
          completedExperiments: completedExperiments.length,
          failedExperiments: failedExperiments.length,
          runningExperiments: runningExperiments.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        enqueueSnackbar('Failed to load dashboard data. Please try again later.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enqueueSnackbar]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Link href="/ideas/create" passHref>
          <Button variant="contained" color="primary">
            Create New Idea
          </Button>
        </Link>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard>
            <IconWrapper sx={{ bgcolor: 'primary.light' }}>
              <LightbulbIcon color="primary" />
            </IconWrapper>
            <Typography variant="h3" component="div" gutterBottom>
              {stats.totalIdeas}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Research Ideas
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard>
            <IconWrapper sx={{ bgcolor: 'secondary.light' }}>
              <ScienceIcon color="secondary" />
            </IconWrapper>
            <Typography variant="h3" component="div" gutterBottom>
              {stats.totalExperiments}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Total Experiments
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard>
            <IconWrapper sx={{ bgcolor: '#e6f7ee' }}>
              <AutoGraphIcon sx={{ color: '#66BB6A' }} />
            </IconWrapper>
            <Typography variant="h3" component="div" gutterBottom>
              {stats.completedExperiments}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Completed Experiments
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>

      {/* More detailed stats */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Experiment Status Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
              <Typography variant="body1">
                Completed: {stats.completedExperiments}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon sx={{ color: 'warning.main', mr: 1 }} />
              <Typography variant="body1">
                Running: {stats.runningExperiments}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ErrorIcon sx={{ color: 'error.main', mr: 1 }} />
              <Typography variant="body1">
                Failed: {stats.failedExperiments}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Ideas */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Recent Research Ideas</Typography>
          <Link href="/ideas" passHref>
            <Button color="primary">View All</Button>
          </Link>
        </Box>
        
        {recentIdeas.length > 0 ? (
          <Grid container spacing={3}>
            {recentIdeas.map((idea) => (
              <Grid item xs={12} key={idea.id}>
                <Card>
                  <CardActionArea component={Link} href={`/ideas/${idea.id}`}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" component="div">
                          {idea.title}
                        </Typography>
                        <StatusBadge status={idea.status} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {idea.tldr}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Created: {new Date(idea.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Experiments: {idea.experiments?.length || 0}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No research ideas yet. Create your first research idea to get started!
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Link href="/ideas/create" passHref>
                <Button variant="contained" color="primary">
                  Create New Idea
                </Button>
              </Link>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
} 