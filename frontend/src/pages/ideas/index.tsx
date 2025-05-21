import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActionArea, 
  Grid, 
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from '@mui/material';
import { ideasApi } from '../../services/api';
import { ResearchIdea, IdeaStatus } from '../../types/models';
import Link from 'next/link';
import { useSnackbar } from 'notistack';
import StatusBadge from '../../components/common/StatusBadge';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/Add';
import { websocketService } from '../../services/websocket';

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<ResearchIdea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<ResearchIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const { enqueueSnackbar } = useSnackbar();

  // Fetch ideas when component mounts
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setLoading(true);
        const data = await ideasApi.getAllIdeas();
        setIdeas(data);
        setFilteredIdeas(data);
      } catch (error) {
        console.error('Error fetching ideas:', error);
        enqueueSnackbar('Failed to load research ideas', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();

    // Subscribe to WebSocket updates for all ideas
    const handleIdeaUpdate = (updatedIdea: ResearchIdea) => {
      setIdeas(prevIdeas => {
        const newIdeas = prevIdeas.map(idea => 
          idea.id === updatedIdea.id ? updatedIdea : idea
        );
        return newIdeas;
      });
    };

    // Subscribe to updates for each idea
    ideas.forEach(idea => {
      websocketService.subscribeToIdeaUpdates(idea.id, handleIdeaUpdate);
    });

    // Cleanup subscriptions
    return () => {
      ideas.forEach(idea => {
        websocketService.unsubscribeFromIdeaUpdates(idea.id);
      });
    };
  }, [enqueueSnackbar]);

  // Filter and sort ideas when search or filters change
  useEffect(() => {
    let result = [...ideas];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(idea => idea.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        idea => 
          idea.title.toLowerCase().includes(lowercasedSearch) ||
          idea.keywords.toLowerCase().includes(lowercasedSearch) ||
          idea.tldr.toLowerCase().includes(lowercasedSearch) ||
          idea.abstract.toLowerCase().includes(lowercasedSearch)
      );
    }

    // Apply sorting
    result = result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    setFilteredIdeas(result);
  }, [ideas, searchTerm, statusFilter, sortBy]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

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
          Research Ideas
        </Typography>
        <Link href="/ideas/create" passHref>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
          >
            Create New Idea
          </Button>
        </Link>
      </Box>

      {/* Filters and search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search ideas by title, keywords, or content..."
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value={IdeaStatus.DRAFT}>Draft</MenuItem>
                <MenuItem value={IdeaStatus.GENERATING}>Generating</MenuItem>
                <MenuItem value={IdeaStatus.GENERATED}>Generated</MenuItem>
                <MenuItem value={IdeaStatus.FAILED}>Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                id="sort-by"
                value={sortBy}
                onChange={handleSortChange}
                label="Sort By"
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="title-asc">Title (A-Z)</MenuItem>
                <MenuItem value="title-desc">Title (Z-A)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Ideas list */}
      {filteredIdeas.length > 0 ? (
        <Grid container spacing={3}>
          {filteredIdeas.map((idea) => (
            <Grid item xs={12} sm={6} md={4} key={idea.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  }
                }}
              >
                <CardActionArea 
                  component={Link} 
                  href={`/ideas/${idea.id}`}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <CardContent sx={{ width: '100%', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <StatusBadge status={idea.status} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(idea.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="h6" component="div" gutterBottom>
                      {idea.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                      {idea.tldr}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {idea.keywords.split(',').map((keyword, index) => (
                        <Chip 
                          key={index} 
                          label={keyword.trim()} 
                          size="small"
                          sx={{ 
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                            fontSize: '0.7rem',
                          }}
                        />
                      ))}
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
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
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No research ideas found</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters to see more results.'
              : 'Create your first research idea to get started.'}
          </Typography>
          {!searchTerm && statusFilter === 'all' && (
            <Link href="/ideas/create" passHref>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
              >
                Create New Idea
              </Button>
            </Link>
          )}
        </Paper>
      )}
    </Box>
  );
} 