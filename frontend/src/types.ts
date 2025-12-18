export interface Pet {
  id: number;
  name: string;
  animal_type: string;
  owner_name: string;
  date_of_birth: string;
  created_at: string;
}

export interface MedicalRecord {
  id: number;
  pet_id: number;
  record_type: 'vaccine' | 'allergy';
  name: string;
  date_administered: string | null;
  next_due_date: string | null;
  reactions: string | null;
  severity: 'mild' | 'severe' | null;
  created_at: string;
}

export interface PetWithRecords extends Pet {
  records: MedicalRecord[];
}

export interface Stats {
  totalPets: number;
  petsByType: Array<{ animal_type: string; count: number }>;
  totalVaccines: number;
  totalAllergies: number;
  upcomingVaccines: Array<MedicalRecord & { pet_name: string; pet_id: number }>;
  severeAllergies: Array<{ pet_id: number; pet_name: string; allergies: Array<{ name: string; reactions: string | null }> }>;
}

export interface CreatePetData {
  name: string;
  animal_type: string;
  owner_name: string;
  date_of_birth: string;
}

export interface CreateRecordData {
  record_type: 'vaccine' | 'allergy';
  name: string;
  date_administered?: string;
  next_due_date?: string;
  reactions?: string;
  severity?: 'mild' | 'severe';
}

