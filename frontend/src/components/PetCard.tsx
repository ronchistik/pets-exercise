import { Link } from 'react-router-dom';
import { Pet } from '../types';

interface PetCardProps {
  pet: Pet;
}

const ANIMAL_EMOJIS: Record<string, string> = {
  dog: '🐕',
  cat: '🐱',
  bird: '🐦',
  rabbit: '🐰',
  hamster: '🐹',
  fish: '🐠',
};

export function PetCard({ pet }: PetCardProps) {
  const emoji = ANIMAL_EMOJIS[pet.animal_type.toLowerCase()] || '🐾';
  
  return (
    <Link to={`/pets/${pet.id}`} className="pet-card">
      <div className="pet-avatar">{emoji}</div>
      <div className="pet-info">
        <h3>{pet.name}</h3>
        <p>{pet.animal_type} • {pet.owner_name}</p>
      </div>
    </Link>
  );
}

