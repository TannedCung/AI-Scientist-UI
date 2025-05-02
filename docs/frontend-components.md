# Frontend Components

The frontend of the AI Scientist Paper Generator is built using Next.js and Material UI. This document outlines the key components and pages.

## Component Structure

```
src/
├── components/
│   └── layout/
│       └── MainLayout.tsx      # Main application layout with navigation
├── pages/
│   ├── _app.tsx               # Next.js app wrapper with MUI theme
│   ├── index.tsx              # Homepage
│   ├── research/
│   │   ├── create.tsx         # Create research idea form
│   │   └── [id].tsx           # Research idea details page
│   └── experiments/
│       ├── index.tsx          # List of experiments
│       └── [id].tsx           # Experiment details page
├── types/
│   └── index.ts               # TypeScript type definitions
├── utils/
│   ├── api.ts                 # API client
│   └── createEmotionCache.ts  # MUI styling utility
└── theme/
    └── theme.ts               # MUI theme configuration
```

## Layout Components

### MainLayout

The `MainLayout` component provides the overall application layout including:

- Top app bar with the application title
- Side navigation drawer with links to main sections
- Responsive design that adapts to desktop and mobile screens
- Content area for page components

```jsx
<MainLayout>
  <PageContent />
</MainLayout>
```

## Page Components

### Homepage (index.tsx)

The homepage provides:

- Application introduction
- Cards for the main actions (Create Research Idea and View Experiments)
- Links to the key sections of the application

### Create Research Idea (research/create.tsx)

A multi-step form that allows users to:

1. Enter research idea details (title, keywords, TL;DR, abstract)
2. Upload a code file for experimentation
3. Submit the research idea and optionally generate research hypotheses

Key features:
- Form validation
- Progress stepper
- File upload handling
- Success/error notifications

### Research Idea Details (research/[id].tsx)

Displays details of a specific research idea:

- Research idea metadata (title, keywords, TL;DR, abstract)
- Links to files (markdown and code)
- List of related experiments
- Button to start a new experiment

### Experiments List (experiments/index.tsx)

Lists all experiments in the system:

- Table of experiments with:
  - ID
  - Research idea title
  - Status (with color-coded chip)
  - Timestamps
  - Action buttons
- Filter and sort options
- Empty state with call-to-action

### Experiment Details (experiments/[id].tsx)

Displays details of a specific experiment:

- Experiment status and metadata
- Associated research idea details
- Link to the experiment results (HTML visualization)
- Real-time status updates for running experiments

## Utility Components

### API Client (utils/api.ts)

The API client provides functions for interacting with the backend:

- Research idea operations (create, get, list)
- Experiment operations (run, get status, list)
- Error handling and response processing

### Theme Configuration (theme/theme.ts)

Defines the Material UI theme with:

- Color palette
- Typography settings
- Component style overrides
- Responsive design breakpoints

## Type Definitions (types/index.ts)

TypeScript interfaces for:

- `ResearchIdea`: Research idea data structure
- `ExperimentRun`: Experiment run data structure
- API response types for various operations

## State Management

The application uses React's built-in state management:

- `useState` for local component state
- `useEffect` for side effects like data fetching
- `useRouter` for navigation and URL parameters

Example of data fetching pattern:

```jsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await api.getData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, [dependencies]);
```

## Form Handling

Forms use controlled components with React state:

```jsx
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  // Form submission logic
};
```

## Styling Approach

The application uses Material UI's styling system:

- Styled components via MUI's `sx` prop
- Theme-based styling for consistency
- Responsive design using MUI's breakpoints 