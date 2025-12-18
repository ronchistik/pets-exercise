interface BadgeProps {
  variant: 'vaccine' | 'allergy' | 'mild' | 'severe';
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {children}
    </span>
  );
}

