# Usage Guide

This guide will walk you through the main functionality of the AI Scientist Paper Generator.

## Overview

The AI Scientist Paper Generator automates the process of generating scientific papers. The workflow consists of:

1. Creating a research idea
2. Generating research hypotheses
3. Running experiments
4. Viewing results

## Creating a Research Idea

### Step 1: Navigate to the Create Research Idea Page

From the homepage, click on the **Create New Idea** button or use the sidebar navigation to go to "Create Research Idea".

### Step 2: Enter Research Idea Details

Fill out the research idea form with:

- **Title**: A descriptive title for your research
- **Keywords**: Key terms related to your research, separated by commas
- **TL;DR**: A brief summary of your research idea (1-2 sentences)
- **Abstract**: A detailed description of your research idea

Example:
```
Title: Enhancing Deep Learning Model Generalization Through Adversarial Training

Keywords: deep learning, adversarial training, model robustness, generalization

TL;DR: Investigating how adversarial training techniques can improve model generalization on unseen data.

Abstract: Deep learning models often struggle to generalize beyond their training distribution. This research explores how adversarial training techniques can be leveraged to enhance model robustness and generalization capabilities. By systematically introducing perturbations during training, we hypothesize that models will learn more robust features that transfer better to unseen data. This work aims to quantify the relationship between adversarial training intensity and generalization performance across different model architectures and datasets.
```

Click **Next** to proceed.

### Step 3: Upload Code File

Upload a Python code file (`.py`) that will be used for the experiments. This file should contain the implementation of your models, training logic, or experiment setup.

Requirements for the code file:
- Must be a valid Python file
- Should include necessary imports
- May contain functions or classes for experiments
- Should be self-contained or reference only standard libraries

Example of a basic code file:
```python
import torch
import torch.nn as nn
import torch.optim as optim
import torchvision.transforms as transforms

class SimpleModel(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(SimpleModel, self).__init__()
        self.layer1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.layer2 = nn.Linear(hidden_size, output_size)
    
    def forward(self, x):
        x = self.layer1(x)
        x = self.relu(x)
        x = self.layer2(x)
        return x

def train_model(model, train_loader, optimizer, criterion, epochs=5):
    model.train()
    for epoch in range(epochs):
        for data, target in train_loader:
            optimizer.zero_grad()
            output = model(data)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
    return model
```

Click **Submit** to create your research idea.

### Step 4: Generate Research Hypotheses

After successful creation, you'll be prompted to generate research hypotheses. Click **Generate Research Hypotheses** to let the AI analyze your idea and generate potential research directions.

This process may take a few minutes as it involves:
- Analyzing your research idea
- Checking for novelty against existing literature
- Generating multiple hypotheses
- Refining the hypotheses

Once complete, you'll be redirected to the research idea details page.

## Running Experiments

### Step 1: View Research Idea Details

On the research idea details page, you'll see:
- Your research idea details
- Links to your uploaded files
- A list of any previous experiments
- A **Run Experiment** button

### Step 2: Start an Experiment

Click the **Run Experiment** button to start a new experiment run. This will:
- Create a new experiment in the database
- Start an asynchronous task to run the AI Scientist engine
- Redirect you to the experiment details page

## Monitoring Experiment Progress

### Step 1: View Experiment Details

The experiment details page shows:
- Experiment status (pending, running, completed, or failed)
- Start and completion times
- Associated research idea details
- A link to the results when available

The page automatically refreshes to show the latest status.

### Step 2: Wait for Completion

Experiments typically take between 30 minutes to several hours to complete, depending on:
- The complexity of your research idea
- The depth of the experiment exploration
- The LLM models being used
- Server load and resource availability

### Step 3: View Results

Once the experiment is complete, a **View Results** button will appear. Click this to open the experiment visualization, which shows:
- The tree search exploration path
- Experiment hypothesis and tests
- Results and analyses
- The generated paper content

## Managing Experiments

### Viewing All Experiments

To view all your experiments:
1. Click on "Experiment List" in the sidebar navigation
2. This page shows all experiments across all research ideas
3. You can filter and sort by status, date, or research idea

### Experiment Statuses

Experiments can have the following statuses:
- **Pending**: The experiment is queued but not yet started
- **Running**: The experiment is currently in progress
- **Completed**: The experiment finished successfully
- **Failed**: The experiment encountered an error

### Handling Failed Experiments

If an experiment fails:
1. Check the experiment details for error information
2. Verify your code file is valid and error-free
3. Check the backend logs for detailed error messages
4. Try running a new experiment with modifications

## Best Practices

### Research Idea Formulation

- Be specific about your research question
- Include relevant context and background
- Specify methodology if you have preferences
- Mention related work or approaches

### Code File Preparation

- Keep code modular and well-structured
- Include comments explaining key components
- Ensure all necessary functions are defined
- Test your code independently before uploading

### Experiment Iteration

- Start with simple research ideas and code
- Analyze the results of each experiment
- Refine your research idea based on insights
- Try different approaches or parameters in subsequent runs 