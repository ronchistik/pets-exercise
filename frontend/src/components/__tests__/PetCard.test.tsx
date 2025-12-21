import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PetCard } from '../PetCard'
import { Pet } from '../../types'

const mockPet: Pet = {
  id: 1,
  name: 'Buddy',
  animal_type: 'dog',
  owner_name: 'John Doe',
  date_of_birth: '2020-01-15',
  created_at: '2024-01-01T00:00:00.000Z'
}

function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('PetCard', () => {
  it('should render pet name', () => {
    renderWithRouter(<PetCard pet={mockPet} />)
    expect(screen.getByText('Buddy')).toBeInTheDocument()
  })

  it('should render pet type and owner name', () => {
    renderWithRouter(<PetCard pet={mockPet} />)
    expect(screen.getByText(/dog • John Doe/)).toBeInTheDocument()
  })

  it('should render correct emoji for dog', () => {
    renderWithRouter(<PetCard pet={mockPet} />)
    expect(screen.getByText('🐕')).toBeInTheDocument()
  })

  it('should render correct emoji for cat', () => {
    const catPet = { ...mockPet, animal_type: 'cat' }
    renderWithRouter(<PetCard pet={catPet} />)
    expect(screen.getByText('🐱')).toBeInTheDocument()
  })

  it('should render default emoji for unknown animal type', () => {
    const unknownPet = { ...mockPet, animal_type: 'elephant' }
    renderWithRouter(<PetCard pet={unknownPet} />)
    expect(screen.getByText('🐾')).toBeInTheDocument()
  })

  it('should link to pet detail page', () => {
    renderWithRouter(<PetCard pet={mockPet} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/pets/1')
  })

  it('should handle case insensitive animal types', () => {
    const upperCasePet = { ...mockPet, animal_type: 'DOG' }
    renderWithRouter(<PetCard pet={upperCasePet} />)
    expect(screen.getByText('🐕')).toBeInTheDocument()
  })
})
