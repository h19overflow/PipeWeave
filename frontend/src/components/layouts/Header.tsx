import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/datasets': 'Datasets',
  '/pipelines': 'Pipelines',
  '/models': 'Models',
  '/settings': 'Settings',
};

export function Header() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? 'PipeWeave';

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          New Project
        </button>
      </div>
    </header>
  );
}
