import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Pet } from '../types'
import { API_URL, ANIMAL_TYPES } from '../utils'
import { Button, PetCard, Loading, ErrorDisplay, EmptyState } from '../components'
import { useToast } from '../context/ToastContext'

export default function PetList() {
  const { error: showError } = useToast()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [animalType, setAnimalType] = useState('')

  useEffect(() => {
    fetchPets()
  }, [search, animalType])

  const fetchPets = () => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (animalType) params.append('animal_type', animalType)

    fetch(`${API_URL}/pets?${params}`)
      .then(res => res.json())
      .then(data => {
        setPets(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        showError('Failed to load pets')
        setLoading(false)
      })
  }

  if (loading) return <Loading />
  if (error) return <ErrorDisplay message={error} />

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pets</h1>
        <Link to="/pets/new">
          <Button>+ Add Pet</Button>
        </Link>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name..."
          className="form-input search-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="form-select filter-select"
          value={animalType}
          onChange={e => setAnimalType(e.target.value)}
        >
          <option value="">All Types</option>
          {ANIMAL_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {pets.length === 0 ? (
        <EmptyState 
          message="No pets found. Add your first pet!" 
          action={
            <Link to="/pets/new">
              <Button>+ Add Pet</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-3">
          {pets.map(pet => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  )
}

