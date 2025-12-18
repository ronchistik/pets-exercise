export const ANIMAL_EMOJIS: Record<string, string> = {
  dog: '🐕',
  cat: '🐱',
  bird: '🐦',
  rabbit: '🐰',
  hamster: '🐹',
  fish: '🐠',
};

export const ANIMAL_TYPES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish', 'Other'];

export const API_URL = 'http://localhost:3001/api';

export function getAnimalEmoji(type: string): string {
  return ANIMAL_EMOJIS[type?.toLowerCase()] || '🐾';
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
}

export function calculateAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  if (years === 0) return `${months} months`;
  return years === 1 ? '1 year' : `${years} years`;
}

