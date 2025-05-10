import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  TextField, 
  Slider,
  Switch,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import { settingsApi } from '../services/api';
import { useSnackbar } from 'notistack';
import { AIScientistSettings } from '../types/models';

export default function SettingsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [settings, setSettings] = useState<AIScientistSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Fetch settings when component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await settingsApi.getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        enqueueSnackbar('Failed to load settings', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [enqueueSnackbar]);

  const handleSettingsChange = (section: string, field: string, value: any) => {
    if (!settings) return;

    if (section === 'root') {
      setSettings({ ...settings, [field]: value });
    } else {
      const sectionKey = section as keyof AIScientistSettings;
      const sectionValue = settings[sectionKey];
      
      // Make sure the section exists and is an object
      if (sectionValue && typeof sectionValue === 'object') {
        setSettings({
          ...settings,
          [section]: {
            ...sectionValue,
            [field]: value
          }
        });
      }
    }
  };

  const handleNestedSettingsChange = (section: string, nestedSection: string, field: string, value: any) => {
    if (!settings) return;

    const sectionKey = section as keyof AIScientistSettings;
    const sectionValue = settings[sectionKey];
    
    // Make sure the section exists and is an object
    if (sectionValue && typeof sectionValue === 'object') {
      const nestedValue = (sectionValue as any)[nestedSection];
      
      // Make sure the nested section exists and is an object
      if (nestedValue && typeof nestedValue === 'object') {
        setSettings({
          ...settings,
          [section]: {
            ...sectionValue,
            [nestedSection]: {
              ...nestedValue,
              [field]: value
            }
          }
        });
      }
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await settingsApi.updateSettings(settings);
      enqueueSnackbar('Settings saved successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error saving settings:', error);
      enqueueSnackbar('Failed to save settings', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    try {
      setLoading(true);
      await settingsApi.resetSettings();
      const data = await settingsApi.getSettings();
      setSettings(data);
      enqueueSnackbar('Settings reset to defaults', { variant: 'success' });
    } catch (error) {
      console.error('Error resetting settings:', error);
      enqueueSnackbar('Failed to reset settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!settings) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Failed to load settings
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Settings
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleResetSettings}
            startIcon={<RestartAltIcon />}
            sx={{ mr: 2 }}
            disabled={saving}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSettings}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        These settings control the behavior of the AI Scientist. Changes will apply to all new research ideas and experiments.
      </Alert>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">General Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Data Directory"
                    value={settings.data_dir}
                    onChange={(e) => handleSettingsChange('root', 'data_dir', e.target.value)}
                    helperText="Directory where input data is stored"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Log Directory"
                    value={settings.log_dir}
                    onChange={(e) => handleSettingsChange('root', 'log_dir', e.target.value)}
                    helperText="Directory where logs will be stored"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Workspace Directory"
                    value={settings.workspace_dir}
                    onChange={(e) => handleSettingsChange('root', 'workspace_dir', e.target.value)}
                    helperText="Directory where experiment files will be created"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Experiment Name"
                    value={settings.exp_name}
                    onChange={(e) => handleSettingsChange('root', 'exp_name', e.target.value)}
                    helperText="Prefix for experiment folders"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.preprocess_data}
                        onChange={(e) => handleSettingsChange('root', 'preprocess_data', e.target.checked)}
                      />
                    }
                    label="Preprocess Data"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Whether to preprocess data before running experiments
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.copy_data}
                        onChange={(e) => handleSettingsChange('root', 'copy_data', e.target.checked)}
                      />
                    }
                    label="Copy Data"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Whether to copy data to experiment directory
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.generate_report}
                        onChange={(e) => handleSettingsChange('root', 'generate_report', e.target.checked)}
                      />
                    }
                    label="Generate Report"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Whether to generate a summary report after experiments
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Execution Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Execution Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Timeout (seconds)"
                    type="number"
                    value={settings.exec.timeout}
                    onChange={(e) => handleSettingsChange('exec', 'timeout', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 1 } }}
                    helperText="Maximum time for executing experiments in seconds"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Agent File Name"
                    value={settings.exec.agent_file_name}
                    onChange={(e) => handleSettingsChange('exec', 'agent_file_name', e.target.value)}
                    helperText="Filename for the AI agent code"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.exec.format_tb_ipython}
                        onChange={(e) => handleSettingsChange('exec', 'format_tb_ipython', e.target.checked)}
                      />
                    }
                    label="Format Traceback for IPython"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Format error tracebacks for IPython compatibility
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* LLM Model Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">LLM Model Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Code Generation Model
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Model Name"
                        value={settings.agent.code.model}
                        onChange={(e) => handleNestedSettingsChange('agent', 'code', 'model', e.target.value)}
                        helperText="LLM model for code generation"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography gutterBottom>
                        Temperature: {settings.agent.code.temp}
                      </Typography>
                      <Slider
                        value={settings.agent.code.temp}
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={(_, value) => handleNestedSettingsChange('agent', 'code', 'temp', value)}
                        valueLabelDisplay="auto"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Lower values yield more deterministic outputs
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Feedback Model
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Model Name"
                        value={settings.agent.feedback.model}
                        onChange={(e) => handleNestedSettingsChange('agent', 'feedback', 'model', e.target.value)}
                        helperText="LLM model for generating feedback"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography gutterBottom>
                        Temperature: {settings.agent.feedback.temp}
                      </Typography>
                      <Slider
                        value={settings.agent.feedback.temp}
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={(_, value) => handleNestedSettingsChange('agent', 'feedback', 'temp', value)}
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    VLM Feedback Model
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Model Name"
                        value={settings.agent.vlm_feedback.model}
                        onChange={(e) => handleNestedSettingsChange('agent', 'vlm_feedback', 'model', e.target.value)}
                        helperText="Vision-enabled LLM model for feedback"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography gutterBottom>
                        Temperature: {settings.agent.vlm_feedback.temp}
                      </Typography>
                      <Slider
                        value={settings.agent.vlm_feedback.temp}
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={(_, value) => handleNestedSettingsChange('agent', 'vlm_feedback', 'temp', value)}
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Report Generation Model
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Model Name"
                        value={settings.report.model}
                        onChange={(e) => handleSettingsChange('report', 'model', e.target.value)}
                        helperText="LLM model for generating reports"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography gutterBottom>
                        Temperature: {settings.report.temp}
                      </Typography>
                      <Slider
                        value={settings.report.temp}
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={(_, value) => handleSettingsChange('report', 'temp', value)}
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Agent Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Agent Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Agent Type</InputLabel>
                    <Select
                      value={settings.agent.type}
                      label="Agent Type"
                      onChange={(e) => handleSettingsChange('agent', 'type', e.target.value)}
                    >
                      <MenuItem value="reflexion">Reflexion</MenuItem>
                      <MenuItem value="dsf">DSF</MenuItem>
                      <MenuItem value="react">ReAct</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Number of Workers"
                    type="number"
                    value={settings.agent.num_workers}
                    onChange={(e) => handleSettingsChange('agent', 'num_workers', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 1 } }}
                    helperText="Number of parallel workers for experiments"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Steps"
                    type="number"
                    value={settings.agent.steps}
                    onChange={(e) => handleSettingsChange('agent', 'steps', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 1 } }}
                    helperText="Maximum number of steps per experiment"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="K-Fold Validation"
                    type="number"
                    value={settings.agent.k_fold_validation}
                    onChange={(e) => handleSettingsChange('agent', 'k_fold_validation', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 2 } }}
                    helperText="K for K-fold cross-validation"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Multi-Seed Evaluation
                  </Typography>
                  <TextField
                    fullWidth
                    label="Number of Seeds"
                    type="number"
                    value={settings.agent.multi_seed_eval.num_seeds}
                    onChange={(e) => handleNestedSettingsChange('agent', 'multi_seed_eval', 'num_seeds', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 1 } }}
                    helperText="Number of random seeds for evaluation"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Stage Iterations
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Stage 1 Max Iterations"
                        type="number"
                        value={settings.agent.stages.stage1_max_iters}
                        onChange={(e) => handleNestedSettingsChange('agent', 'stages', 'stage1_max_iters', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Stage 2 Max Iterations"
                        type="number"
                        value={settings.agent.stages.stage2_max_iters}
                        onChange={(e) => handleNestedSettingsChange('agent', 'stages', 'stage2_max_iters', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Stage 3 Max Iterations"
                        type="number"
                        value={settings.agent.stages.stage3_max_iters}
                        onChange={(e) => handleNestedSettingsChange('agent', 'stages', 'stage3_max_iters', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Stage 4 Max Iterations"
                        type="number"
                        value={settings.agent.stages.stage4_max_iters}
                        onChange={(e) => handleNestedSettingsChange('agent', 'stages', 'stage4_max_iters', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.agent.expose_prediction}
                        onChange={(e) => handleSettingsChange('agent', 'expose_prediction', e.target.checked)}
                      />
                    }
                    label="Expose Prediction"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Whether to expose model predictions during experiments
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.agent.data_preview}
                        onChange={(e) => handleSettingsChange('agent', 'data_preview', e.target.checked)}
                      />
                    }
                    label="Data Preview"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Whether to include data previews in context
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Search Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Search & Debug Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Debug Depth"
                    type="number"
                    value={settings.agent.search.max_debug_depth}
                    onChange={(e) => handleNestedSettingsChange('agent', 'search', 'max_debug_depth', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 1 } }}
                    helperText="Maximum recursion depth for debugging"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>
                    Debug Probability: {settings.agent.search.debug_prob}
                  </Typography>
                  <Slider
                    value={settings.agent.search.debug_prob}
                    min={0}
                    max={1}
                    step={0.1}
                    onChange={(_, value) => handleNestedSettingsChange('agent', 'search', 'debug_prob', value)}
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Probability of entering debug mode when an error occurs
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Number of Drafts"
                    type="number"
                    value={settings.agent.search.num_drafts}
                    onChange={(e) => handleNestedSettingsChange('agent', 'search', 'num_drafts', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 1 } }}
                    helperText="Number of code drafts to generate"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.debug.stage4}
                        onChange={(e) => handleSettingsChange('debug', 'stage4', e.target.checked)}
                      />
                    }
                    label="Debug Stage 4"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Enable additional debugging for stage 4
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Experiment Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Experiment Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Number of Synthetic Datasets"
                    type="number"
                    value={settings.experiment.num_syn_datasets}
                    onChange={(e) => handleSettingsChange('experiment', 'num_syn_datasets', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 0 } }}
                    helperText="Number of synthetic datasets to generate for experiments"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
} 