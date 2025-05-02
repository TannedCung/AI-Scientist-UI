import React from 'react';
import { Box, Typography, Container } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          AI Scientist Paper Generator
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" gutterBottom>
          Generate workshop-level scientific papers with AI-driven research
        </Typography>
        <Typography variant="body1" align="center" sx={{ maxWidth: '600px', mt: 4 }}>
          Welcome to the AI Scientist Paper Generator. This platform allows you to create research ideas,
          generate hypotheses, run experiments, and produce scientific papers using AI.
        </Typography>
      </Box>
    </Container>
  );
} 