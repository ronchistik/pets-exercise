import express, { Request, Response } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new Database('novellia_pets.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    animal_type TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS medical_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER NOT NULL,
    record_type TEXT NOT NULL,
    name TEXT NOT NULL,
    date_administered TEXT,
    next_due_date TEXT,
    reactions TEXT,
    severity TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
  );
`);

// Add next_due_date column if it doesn't exist (for existing databases)
try {
  db.exec(`ALTER TABLE medical_records ADD COLUMN next_due_date TEXT;`);
} catch (e) {
  // Column already exists, ignore error
}

// Types
interface Pet {
  id: number;
  name: string;
  animal_type: string;
  owner_name: string;
  date_of_birth: string;
  created_at: string;
}

interface MedicalRecord {
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

interface PetWithRecords extends Pet {
  records: MedicalRecord[];
}

interface CreatePetBody {
  name: string;
  animal_type: string;
  owner_name: string;
  date_of_birth: string;
}

interface CreateRecordBody {
  record_type: 'vaccine' | 'allergy';
  name: string;
  date_administered?: string;
  next_due_date?: string;
  reactions?: string;
  severity?: 'mild' | 'severe';
}

interface Stats {
  totalPets: number;
  petsByType: Array<{ animal_type: string; count: number }>;
  totalVaccines: number;
  totalAllergies: number;
  upcomingVaccines: Array<MedicalRecord & { pet_name: string; pet_id: number }>;
  severeAllergies: Array<{ pet_id: number; pet_name: string; allergies: Array<{ name: string; reactions: string | null }> }>;
}

// === PET ROUTES ===

// Get all pets with optional search/filter
app.get('/api/pets', (req: Request, res: Response) => {
  try {
    const { search, animal_type } = req.query;
    let query = 'SELECT * FROM pets WHERE 1=1';
    const params: string[] = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }
    if (animal_type) {
      query += ' AND animal_type = ?';
      params.push(animal_type as string);
    }

    query += ' ORDER BY created_at DESC';
    const pets = db.prepare(query).all(...params) as Pet[];
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get single pet with medical records
app.get('/api/pets/:id', (req: Request, res: Response) => {
  try {
    const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(req.params.id) as Pet | undefined;
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    const records = db.prepare('SELECT * FROM medical_records WHERE pet_id = ? ORDER BY created_at DESC').all(req.params.id) as MedicalRecord[];
    const petWithRecords: PetWithRecords = { ...pet, records };
    res.json(petWithRecords);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create pet
app.post('/api/pets', (req: Request<{}, {}, CreatePetBody>, res: Response) => {
  try {
    const { name, animal_type, owner_name, date_of_birth } = req.body;
    
    if (!name || !animal_type || !owner_name || !date_of_birth) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = db.prepare(
      'INSERT INTO pets (name, animal_type, owner_name, date_of_birth) VALUES (?, ?, ?, ?)'
    ).run(name, animal_type, owner_name, date_of_birth);

    const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(result.lastInsertRowid) as Pet;
    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update pet
app.put('/api/pets/:id', (req: Request<{ id: string }, {}, CreatePetBody>, res: Response) => {
  try {
    const { name, animal_type, owner_name, date_of_birth } = req.body;
    
    if (!name || !animal_type || !owner_name || !date_of_birth) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = db.prepare(
      'UPDATE pets SET name = ?, animal_type = ?, owner_name = ?, date_of_birth = ? WHERE id = ?'
    ).run(name, animal_type, owner_name, date_of_birth, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(req.params.id) as Pet;
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete pet
app.delete('/api/pets/:id', (req: Request, res: Response) => {
  try {
    // Delete associated records first
    db.prepare('DELETE FROM medical_records WHERE pet_id = ?').run(req.params.id);
    const result = db.prepare('DELETE FROM pets WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// === MEDICAL RECORD ROUTES ===

// Get records for a pet (with optional type filter)
app.get('/api/pets/:petId/records', (req: Request, res: Response) => {
  try {
    const { record_type } = req.query;
    let query = 'SELECT * FROM medical_records WHERE pet_id = ?';
    const params: (string | number)[] = [Number(req.params.petId)];

    if (record_type) {
      query += ' AND record_type = ?';
      params.push(record_type as string);
    }

    query += ' ORDER BY created_at DESC';
    const records = db.prepare(query).all(...params) as MedicalRecord[];
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create medical record
app.post('/api/pets/:petId/records', (req: Request<{ petId: string }, {}, CreateRecordBody>, res: Response) => {
  try {
    const { record_type, name, date_administered, next_due_date, reactions, severity } = req.body;
    const pet_id = req.params.petId;

    if (!record_type || !name) {
      return res.status(400).json({ error: 'Record type and name are required' });
    }

    if (record_type === 'vaccine' && !date_administered && !next_due_date) {
      return res.status(400).json({ error: 'Vaccines require either a date administered or a due date' });
    }

    if (record_type === 'allergy' && !severity) {
      return res.status(400).json({ error: 'Severity is required for allergies' });
    }

    // Check for duplicate record (same type + name for this pet)
    const existing = db.prepare(
      'SELECT id FROM medical_records WHERE pet_id = ? AND record_type = ? AND name = ?'
    ).get(pet_id, record_type, name);

    if (existing) {
      return res.status(400).json({ error: `This pet already has a ${record_type} record for "${name}"` });
    }

    const result = db.prepare(
      'INSERT INTO medical_records (pet_id, record_type, name, date_administered, next_due_date, reactions, severity) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(pet_id, record_type, name, date_administered || null, next_due_date || null, reactions || null, severity || null);

    const record = db.prepare('SELECT * FROM medical_records WHERE id = ?').get(result.lastInsertRowid) as MedicalRecord;
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update medical record
app.put('/api/records/:id', (req: Request<{ id: string }, {}, CreateRecordBody>, res: Response) => {
  try {
    const { record_type, name, date_administered, next_due_date, reactions, severity } = req.body;

    if (!record_type || !name) {
      return res.status(400).json({ error: 'Record type and name are required' });
    }

    // Get the current record to find its pet_id
    const currentRecord = db.prepare('SELECT pet_id FROM medical_records WHERE id = ?').get(req.params.id) as { pet_id: number } | undefined;
    
    if (!currentRecord) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Check for duplicate record (same type + name for this pet, excluding current record)
    const existing = db.prepare(
      'SELECT id FROM medical_records WHERE pet_id = ? AND record_type = ? AND name = ? AND id != ?'
    ).get(currentRecord.pet_id, record_type, name, req.params.id);

    if (existing) {
      return res.status(400).json({ error: `This pet already has a ${record_type} record for "${name}"` });
    }

    const result = db.prepare(
      'UPDATE medical_records SET record_type = ?, name = ?, date_administered = ?, next_due_date = ?, reactions = ?, severity = ? WHERE id = ?'
    ).run(record_type, name, date_administered || null, next_due_date || null, reactions || null, severity || null, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const record = db.prepare('SELECT * FROM medical_records WHERE id = ?').get(req.params.id) as MedicalRecord;
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete medical record
app.delete('/api/records/:id', (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM medical_records WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// === DASHBOARD STATS ===

app.get('/api/stats', (req: Request, res: Response) => {
  try {
    const totalPets = (db.prepare('SELECT COUNT(*) as count FROM pets').get() as { count: number }).count;
    const petsByType = db.prepare('SELECT animal_type, COUNT(*) as count FROM pets GROUP BY animal_type').all() as Array<{ animal_type: string; count: number }>;
    const totalVaccines = (db.prepare("SELECT COUNT(*) as count FROM medical_records WHERE record_type = 'vaccine'").get() as { count: number }).count;
    const totalAllergies = (db.prepare("SELECT COUNT(*) as count FROM medical_records WHERE record_type = 'allergy'").get() as { count: number }).count;
    
    // Get vaccines due within next 60 days or overdue
    const sixtyDaysOut = new Date();
    sixtyDaysOut.setDate(sixtyDaysOut.getDate() + 60);
    const upcomingVaccines = db.prepare(
      "SELECT mr.*, p.name as pet_name, p.id as pet_id FROM medical_records mr JOIN pets p ON mr.pet_id = p.id WHERE mr.record_type = 'vaccine' AND mr.next_due_date IS NOT NULL AND mr.next_due_date <= ? ORDER BY mr.next_due_date ASC LIMIT 10"
    ).all(sixtyDaysOut.toISOString().split('T')[0]) as Array<MedicalRecord & { pet_name: string; pet_id: number }>;
    
    // Group severe allergies by pet
    const severeAllergyRecords = db.prepare(
      "SELECT p.id as pet_id, p.name as pet_name, mr.name as allergy_name, mr.reactions FROM medical_records mr JOIN pets p ON mr.pet_id = p.id WHERE mr.record_type = 'allergy' AND mr.severity = 'severe' ORDER BY p.name, mr.name"
    ).all() as Array<{ pet_id: number; pet_name: string; allergy_name: string; reactions: string | null }>;
    
    // Group by pet
    const severeAllergiesMap = new Map<number, { pet_id: number; pet_name: string; allergies: Array<{ name: string; reactions: string | null }> }>();
    severeAllergyRecords.forEach(record => {
      if (!severeAllergiesMap.has(record.pet_id)) {
        severeAllergiesMap.set(record.pet_id, {
          pet_id: record.pet_id,
          pet_name: record.pet_name,
          allergies: []
        });
      }
      severeAllergiesMap.get(record.pet_id)!.allergies.push({
        name: record.allergy_name,
        reactions: record.reactions
      });
    });
    const severeAllergies = Array.from(severeAllergiesMap.values());

    const stats: Stats = {
      totalPets,
      petsByType,
      totalVaccines,
      totalAllergies,
      upcomingVaccines,
      severeAllergies
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// === EXPORT (Additional Feature) ===

app.get('/api/pets/:id/export', (req: Request, res: Response) => {
  try {
    const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(req.params.id) as Pet | undefined;
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    const records = db.prepare('SELECT * FROM medical_records WHERE pet_id = ?').all(req.params.id) as MedicalRecord[];
    
    res.setHeader('Content-Disposition', `attachment; filename="${pet.name}_medical_records.json"`);
    res.json({ pet, records });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

