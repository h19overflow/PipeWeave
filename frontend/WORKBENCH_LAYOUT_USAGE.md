# WorkbenchLayout Component Usage

## Overview

The WorkbenchLayout provides a unified wrapper for all workbench pages with:
- Collapsible sidebar navigation (WorkbenchSidebar)
- Workflow progress tracking (localStorage persistence)
- Page header with breadcrumb and next step navigation
- Animated page transitions with Framer Motion

## File Structure

```
src/
├── components/
│   ├── layouts/
│   │   ├── WorkbenchLayout.tsx       # Main layout wrapper
│   │   ├── WorkbenchHeader.tsx       # Header with breadcrumb
│   │   └── index.ts                  # Barrel exports
│   └── navigation/
│       ├── WorkbenchSidebar.tsx      # Sidebar component (pre-existing)
│       └── navigation.config.ts      # Workflow steps config
└── hooks/
    └── useWorkflowProgress.ts        # Workflow state management hook
```

## Setup in Router

```tsx
// App.tsx or router configuration
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorkbenchLayout } from '@/components/layouts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page without layout */}
        <Route path="/" element={<LandingPage />} />

        {/* Workbench routes with unified layout */}
        <Route element={<WorkbenchLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dataset" element={<DatasetPage />} />
          <Route path="/schema" element={<SchemaPage />} />
          <Route path="/business-rules" element={<BusinessRulesPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

## Using the Workflow Progress Hook

```tsx
// In any page component
import { useWorkflowProgress } from '@/hooks/useWorkflowProgress';

function DatasetPage() {
  const {
    currentStep,           // 'dataset'
    completedSteps,        // ['dashboard', 'dataset']
    markStepComplete,      // Function to mark step as done
    isStepCompleted,       // Check if step is completed
    getNextStep,           // Get next workflow step
    resetProgress,         // Clear all progress
    progress               // 0-100 percentage
  } = useWorkflowProgress();

  const handleComplete = () => {
    // Mark current step as complete when user finishes task
    markStepComplete(currentStep);
  };

  return (
    <div>
      <h1>Dataset Upload</h1>
      <p>Progress: {progress}%</p>
      <button onClick={handleComplete}>Complete Dataset Step</button>
    </div>
  );
}
```

## Custom Header Actions

The WorkbenchHeader supports custom action buttons:

```tsx
// Example page with custom actions
function PipelinePage() {
  return (
    <>
      <WorkbenchHeader
        title="Pipeline Builder"
        actions={
          <>
            <button className="btn-secondary">Save Draft</button>
            <button className="btn-primary">Deploy Pipeline</button>
          </>
        }
        showNextStep={true}
        nextStepPath="/models"
        nextStepLabel="Train Models"
      />
      <div className="p-6">
        {/* Page content */}
      </div>
    </>
  );
}
```

## Layout Features

### 1. Sidebar State Persistence
- Collapsed state is saved to localStorage (`pipeweave_sidebar_collapsed`)
- Persists across browser sessions

### 2. Workflow Progress Tracking
- Completed steps saved to localStorage (`pipeweave_workflow_progress`)
- Visual progress indicator in sidebar
- Step completion badges

### 3. Responsive Design
- Sidebar: 64px (collapsed) or 240px (expanded)
- Content area expands to fill remaining space
- Smooth transitions with Framer Motion

### 4. Accessibility
- Keyboard navigation support
- Reduced motion support via `useReducedMotion()` hook
- Semantic HTML structure

## Design Tokens

```css
--workbench-bg: #0a0a0f;          /* Main background */
--workbench-surface: #131022;      /* Surface elements */
--workbench-text: #ffffff;         /* Primary text */
--workbench-text-muted: #9b92c9;   /* Secondary text */
--workbench-border: #1e1a36;       /* Borders and dividers */
--workbench-accent: #3713ec;       /* Primary accent (gradient start) */
--workbench-accent-end: #4a2aff;   /* Accent gradient end */
```

## TypeScript Types

```typescript
// WorkflowStep type (from navigation.config.ts)
type WorkflowStep =
  | 'dashboard'
  | 'dataset'
  | 'schema'
  | 'business-rules'
  | 'pipeline'
  | 'models'
  | 'settings';

// Hook return type
interface UseWorkflowProgressReturn {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  markStepComplete: (step: WorkflowStep) => void;
  isStepCompleted: (step: WorkflowStep) => boolean;
  getNextStep: () => WorkflowStep | null;
  resetProgress: () => void;
  progress: number;
}

// Header props
interface WorkbenchHeaderProps {
  title?: string;
  actions?: React.ReactNode;
  showNextStep?: boolean;
  nextStepPath?: string;
  nextStepLabel?: string;
}
```

## Example: Complete Workflow Flow

```tsx
// DashboardPage.tsx - First step
function DashboardPage() {
  const { markStepComplete, currentStep } = useWorkflowProgress();

  return (
    <div className="p-6">
      <h1>Dashboard</h1>
      {/* Dashboard content */}
      <button onClick={() => markStepComplete(currentStep)}>
        Start New Project
      </button>
    </div>
  );
}

// DatasetPage.tsx - Second step
function DatasetPage() {
  const { markStepComplete, currentStep, isStepCompleted } = useWorkflowProgress();
  const isDashboardComplete = isStepCompleted('dashboard');

  const handleUploadComplete = () => {
    markStepComplete(currentStep);
    // Navigate to next step automatically
    navigate('/schema');
  };

  return (
    <div className="p-6">
      <h1>Upload Dataset</h1>
      {!isDashboardComplete && (
        <div className="alert">Complete dashboard setup first</div>
      )}
      {/* Upload UI */}
      <button onClick={handleUploadComplete}>Continue to Schema</button>
    </div>
  );
}
```

## Testing

```tsx
// Example test for useWorkflowProgress hook
import { renderHook, act } from '@testing-library/react';
import { useWorkflowProgress } from '@/hooks/useWorkflowProgress';

test('marks step as complete', () => {
  const { result } = renderHook(() => useWorkflowProgress());

  act(() => {
    result.current.markStepComplete('dataset');
  });

  expect(result.current.completedSteps).toContain('dataset');
  expect(result.current.isStepCompleted('dataset')).toBe(true);
});
```
