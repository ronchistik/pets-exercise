export function Loading() {
  return <div className="loading">Loading...</div>;
}

interface ErrorDisplayProps {
  message: string;
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return <div className="error">Error: {message}</div>;
}

interface EmptyStateProps {
  icon?: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = '🐾', message, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <p>{message}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

