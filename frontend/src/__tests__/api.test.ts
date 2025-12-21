import { describe, it, expect } from 'vitest'

const API_URL = 'http://localhost:3001/api'

describe('API Integration Tests', () => {
  describe('GET /api/pets', () => {
    it('should return array of pets', async () => {
      const response = await fetch(`${API_URL}/pets`)
      expect(response.ok).toBe(true)
      
      const pets = await response.json()
      expect(Array.isArray(pets)).toBe(true)
      
      if (pets.length > 0) {
        const pet = pets[0]
        expect(pet).toHaveProperty('id')
        expect(pet).toHaveProperty('name')
        expect(pet).toHaveProperty('animal_type')
        expect(pet).toHaveProperty('owner_name')
        expect(pet).toHaveProperty('date_of_birth')
        expect(pet).toHaveProperty('created_at')
      }
    })
  })

  describe('GET /api/stats', () => {
    it('should return dashboard statistics', async () => {
      const response = await fetch(`${API_URL}/stats`)
      expect(response.ok).toBe(true)
      
      const stats = await response.json()
      expect(stats).toHaveProperty('totalPets')
      expect(stats).toHaveProperty('petsByType')
      expect(stats).toHaveProperty('totalVaccines')
      expect(stats).toHaveProperty('totalAllergies')
      expect(stats).toHaveProperty('upcomingVaccines')
      expect(stats).toHaveProperty('severeAllergies')
      
      expect(typeof stats.totalPets).toBe('number')
      expect(Array.isArray(stats.petsByType)).toBe(true)
      expect(Array.isArray(stats.upcomingVaccines)).toBe(true)
      expect(Array.isArray(stats.severeAllergies)).toBe(true)
    })
  })

  describe('POST /api/pets', () => {
    it('should create a new pet and return it', async () => {
      const newPet = {
        name: 'Test Pet',
        animal_type: 'dog',
        owner_name: 'Test Owner',
        date_of_birth: '2020-01-01'
      }

      const response = await fetch(`${API_URL}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPet)
      })

      expect(response.ok).toBe(true)
      
      const createdPet = await response.json()
      expect(createdPet).toHaveProperty('id')
      expect(createdPet.name).toBe(newPet.name)
      expect(createdPet.animal_type).toBe(newPet.animal_type)
      expect(createdPet.owner_name).toBe(newPet.owner_name)
      expect(createdPet.date_of_birth).toBe(newPet.date_of_birth)

      // Cleanup - delete the created pet
      if (createdPet.id) {
        await fetch(`${API_URL}/pets/${createdPet.id}`, { method: 'DELETE' })
      }
    })

    it('should validate required fields', async () => {
      const invalidPet = {
        name: 'Test Pet'
        // missing required fields
      }

      const response = await fetch(`${API_URL}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPet)
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/pets/:id', () => {
    it('should return pet with records', async () => {
      // First create a pet to ensure we have one
      const newPet = {
        name: 'Test Pet for Detail',
        animal_type: 'cat',
        owner_name: 'Test Owner',
        date_of_birth: '2021-01-01'
      }

      const createResponse = await fetch(`${API_URL}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPet)
      })
      const createdPet = await createResponse.json()

      // Now fetch it
      const response = await fetch(`${API_URL}/pets/${createdPet.id}`)
      expect(response.ok).toBe(true)
      
      const pet = await response.json()
      expect(pet).toHaveProperty('id')
      expect(pet).toHaveProperty('name')
      expect(pet).toHaveProperty('records')
      expect(Array.isArray(pet.records)).toBe(true)

      // Cleanup
      await fetch(`${API_URL}/pets/${createdPet.id}`, { method: 'DELETE' })
    })

    it('should return 404 for non-existent pet', async () => {
      const response = await fetch(`${API_URL}/pets/999999`)
      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/pets/:id', () => {
    it('should update pet and return updated data', async () => {
      // Create a pet first
      const newPet = {
        name: 'Original Name',
        animal_type: 'dog',
        owner_name: 'Original Owner',
        date_of_birth: '2020-01-01'
      }

      const createResponse = await fetch(`${API_URL}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPet)
      })
      const createdPet = await createResponse.json()

      // Update it
      const updatedData = {
        name: 'Updated Name',
        animal_type: 'cat',
        owner_name: 'Updated Owner',
        date_of_birth: '2020-01-01'
      }

      const updateResponse = await fetch(`${API_URL}/pets/${createdPet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })

      expect(updateResponse.ok).toBe(true)
      
      const updatedPet = await updateResponse.json()
      expect(updatedPet.name).toBe('Updated Name')
      expect(updatedPet.animal_type).toBe('cat')
      expect(updatedPet.owner_name).toBe('Updated Owner')

      // Cleanup
      await fetch(`${API_URL}/pets/${createdPet.id}`, { method: 'DELETE' })
    })
  })

  describe('DELETE /api/pets/:id', () => {
    it('should delete pet', async () => {
      // Create a pet first
      const newPet = {
        name: 'Pet to Delete',
        animal_type: 'dog',
        owner_name: 'Test Owner',
        date_of_birth: '2020-01-01'
      }

      const createResponse = await fetch(`${API_URL}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPet)
      })
      const createdPet = await createResponse.json()

      // Delete it
      const deleteResponse = await fetch(`${API_URL}/pets/${createdPet.id}`, {
        method: 'DELETE'
      })

      expect(deleteResponse.ok).toBe(true)

      // Verify it's gone
      const getResponse = await fetch(`${API_URL}/pets/${createdPet.id}`)
      expect(getResponse.status).toBe(404)
    })
  })

  describe('POST /api/pets/:id/records', () => {
    it('should create vaccine record', async () => {
      // Create a pet first
      const newPet = {
        name: 'Pet for Records',
        animal_type: 'dog',
        owner_name: 'Test Owner',
        date_of_birth: '2020-01-01'
      }

      const createPetResponse = await fetch(`${API_URL}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPet)
      })
      const createdPet = await createPetResponse.json()

      // Add vaccine record
      const vaccineRecord = {
        record_type: 'vaccine',
        name: 'Rabies',
        date_administered: '2024-01-01',
        next_due_date: '2025-01-01'
      }

      const recordResponse = await fetch(`${API_URL}/pets/${createdPet.id}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vaccineRecord)
      })

      expect(recordResponse.ok).toBe(true)
      
      const record = await recordResponse.json()
      expect(record).toHaveProperty('id')
      expect(record.record_type).toBe('vaccine')
      expect(record.name).toBe('Rabies')

      // Cleanup
      await fetch(`${API_URL}/pets/${createdPet.id}`, { method: 'DELETE' })
    })

    it('should create allergy record', async () => {
      // Create a pet first
      const newPet = {
        name: 'Pet for Allergy',
        animal_type: 'cat',
        owner_name: 'Test Owner',
        date_of_birth: '2020-01-01'
      }

      const createPetResponse = await fetch(`${API_URL}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPet)
      })
      const createdPet = await createPetResponse.json()

      // Add allergy record
      const allergyRecord = {
        record_type: 'allergy',
        name: 'Peanuts',
        reactions: 'Hives',
        severity: 'severe'
      }

      const recordResponse = await fetch(`${API_URL}/pets/${createdPet.id}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allergyRecord)
      })

      expect(recordResponse.ok).toBe(true)
      
      const record = await recordResponse.json()
      expect(record.record_type).toBe('allergy')
      expect(record.severity).toBe('severe')

      // Cleanup
      await fetch(`${API_URL}/pets/${createdPet.id}`, { method: 'DELETE' })
    })
  })
})
