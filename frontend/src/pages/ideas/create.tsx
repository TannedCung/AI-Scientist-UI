import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Grid, 
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  FormHelperText,
  IconButton
} from '@mui/material';
import { useRouter } from 'next/router';
import { ideasApi } from '../../services/api';
import { useSnackbar } from 'notistack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SendIcon from '@mui/icons-material/Send';

interface IdeaFormData {
  title: string;
  keywords: string;
  tldr: string;
  abstract: string;
}

export default function CreateIdeaPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState<IdeaFormData>({
    title: '',
    keywords: '',
    tldr: '',
    abstract: '',
  });
  const [codeFile, setCodeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<IdeaFormData>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name as keyof IdeaFormData]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Only accept Python files
      if (file.name.endsWith('.py')) {
        setCodeFile(file);
      } else {
        enqueueSnackbar('Please upload a Python (.py) file', { variant: 'error' });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<IdeaFormData> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.keywords.trim()) {
      newErrors.keywords = 'At least one keyword is required';
    }
    
    if (!formData.tldr.trim()) {
      newErrors.tldr = 'TL;DR summary is required';
    }
    
    if (!formData.abstract.trim()) {
      newErrors.abstract = 'Abstract is required';
    } else if (formData.abstract.length < 100) {
      newErrors.abstract = 'Abstract should be at least 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      enqueueSnackbar('Please correct the errors in the form', { variant: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('keywords', formData.keywords);
      formDataObj.append('tldr', formData.tldr);
      formDataObj.append('abstract', formData.abstract);
      
      if (codeFile) {
        formDataObj.append('code_file', codeFile);
      }
      
      const response = await ideasApi.createIdea(formDataObj);
      
      enqueueSnackbar('Research idea created successfully!', { variant: 'success' });
      router.push(`/ideas/${response.id}`);
    } catch (error) {
      console.error('Error creating research idea:', error);
      enqueueSnackbar('Failed to create research idea. Please try again.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          sx={{ mr: 1 }} 
          onClick={() => router.push('/ideas')}
          aria-label="Back to ideas"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Create Research Idea
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            component="form" 
            onSubmit={handleSubmit}
            sx={{ p: 3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Title"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  disabled={loading}
                  placeholder="Enter a descriptive title for your research idea"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="keywords"
                  label="Keywords"
                  fullWidth
                  required
                  value={formData.keywords}
                  onChange={handleInputChange}
                  error={!!errors.keywords}
                  helperText={errors.keywords || "Separate keywords with commas (e.g., machine learning, neural networks, NLP)"}
                  disabled={loading}
                  placeholder="Enter keywords related to your research"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="tldr"
                  label="TL;DR"
                  fullWidth
                  required
                  multiline
                  rows={2}
                  value={formData.tldr}
                  onChange={handleInputChange}
                  error={!!errors.tldr}
                  helperText={errors.tldr || "A brief one or two sentence summary of your research idea"}
                  disabled={loading}
                  placeholder="Provide a one-liner summary of your research idea"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="abstract"
                  label="Abstract"
                  fullWidth
                  required
                  multiline
                  rows={6}
                  value={formData.abstract}
                  onChange={handleInputChange}
                  error={!!errors.abstract}
                  helperText={errors.abstract || "Provide a detailed description of your research idea (min. 100 characters)"}
                  disabled={loading}
                  placeholder="Describe your research idea in detail. Include context, motivation, and potential approaches."
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadFileIcon />}
                    disabled={loading}
                    sx={{ mr: 2 }}
                  >
                    Upload Code File (Optional)
                    <input
                      type="file"
                      hidden
                      accept=".py"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {codeFile && (
                    <Typography variant="body2" color="primary">
                      {codeFile.name} ({Math.round(codeFile.size / 1024)} KB)
                    </Typography>
                  )}
                </Box>
                <FormHelperText>
                  Optional: Upload a Python (.py) file to be used in experiments
                </FormHelperText>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => router.push('/ideas')}
                    sx={{ mr: 2 }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  >
                    {loading ? 'Creating...' : 'Create Research Idea'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tips for Great Research Ideas
              </Typography>
              <Typography variant="body2" paragraph>
                Creating a well-defined research idea is the first step toward generating valuable AI research papers.
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                1. Be Specific
              </Typography>
              <Typography variant="body2" paragraph>
                Define your research question or hypothesis clearly. Vague ideas lead to unfocused experiments.
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                2. Provide Context
              </Typography>
              <Typography variant="body2" paragraph>
                Explain the background and motivation for your research in the abstract.
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                3. Choose Relevant Keywords
              </Typography>
              <Typography variant="body2" paragraph>
                Select keywords that accurately represent your research domain and specific focus areas.
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                4. Code Files (Optional)
              </Typography>
              <Typography variant="body2">
                If you have existing code for your experiment, upload it as a Python file to enhance the AI-generated experiments.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 