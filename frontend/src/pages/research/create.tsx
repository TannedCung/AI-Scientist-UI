import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormHelperText,
} from '@mui/material';
import { researchApi } from '../../utils/api';

export default function CreateResearchIdea() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    keywords: '',
    tldr: '',
    abstract: '',
  });
  
  const [codeFile, setCodeFile] = useState<File | null>(null);
  const [ideaId, setIdeaId] = useState<string | null>(null);
  
  const steps = ['Enter Research Idea Details', 'Upload Code File', 'Generate Ideas'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCodeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!codeFile) {
        throw new Error('Please upload a code file');
      }
      
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('keywords', formData.keywords);
      formDataObj.append('tldr', formData.tldr);
      formDataObj.append('abstract', formData.abstract);
      formDataObj.append('code_file', codeFile);
      
      const response = await researchApi.createIdea(formDataObj);
      
      setIdeaId(response.id);
      setSuccess(`Research idea "${response.title}" created successfully!`);
      setActiveStep(2);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the research idea');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateIdeas = async () => {
    if (!ideaId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await researchApi.generateIdeas(ideaId);
      setSuccess('Ideas generated successfully! Redirecting to run experiments...');
      
      // Redirect to experiment page
      setTimeout(() => {
        router.push(`/research/${ideaId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const isStepOneComplete = () => {
    return formData.title && formData.keywords && formData.tldr && formData.abstract;
  };

  const isStepTwoComplete = () => {
    return !!codeFile;
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" noValidate sx={{ mt: 3 }}>
            <TextField
              required
              fullWidth
              label="Title"
              name="title"
              margin="normal"
              value={formData.title}
              onChange={handleInputChange}
            />
            <TextField
              required
              fullWidth
              label="Keywords (comma separated)"
              name="keywords"
              margin="normal"
              value={formData.keywords}
              onChange={handleInputChange}
              placeholder="deep learning, failure modes, negative results"
            />
            <TextField
              required
              fullWidth
              label="TL;DR"
              name="tldr"
              margin="normal"
              value={formData.tldr}
              onChange={handleInputChange}
              multiline
              rows={2}
            />
            <TextField
              required
              fullWidth
              label="Abstract"
              name="abstract"
              margin="normal"
              value={formData.abstract}
              onChange={handleInputChange}
              multiline
              rows={6}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepOneComplete()}
              >
                Next
              </Button>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box component="form" noValidate sx={{ mt: 3 }}>
            <Typography variant="body1" gutterBottom>
              Upload a Python code file that will be used for the research experiments
            </Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{ mt: 2 }}
            >
              Select Code File
              <input
                type="file"
                accept=".py"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {codeFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {codeFile.name}
              </Typography>
            )}
            <FormHelperText>Upload a Python file (.py)</FormHelperText>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isStepTwoComplete() || loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit'}
              </Button>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}
            <Typography variant="body1" gutterBottom>
              Your research idea has been created successfully!
            </Typography>
            <Typography variant="body2" gutterBottom sx={{ mb: 3 }}>
              Would you like to generate research hypotheses based on your idea?
            </Typography>
            <Button
              variant="contained"
              onClick={handleGenerateIdeas}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Research Hypotheses'}
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Research Idea
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {renderStepContent(activeStep)}
      </Paper>
    </Container>
  );
} 