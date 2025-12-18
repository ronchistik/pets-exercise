import { useState, useEffect, FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CreatePetData, Pet } from '../types'
import { API_URL, ANIMAL_TYPES } from '../utils'
import { Button, Loading, ErrorDisplay } from '../components'
import { useToast } from '../context/ToastContext'

export default function PetForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { success, error } = useToast()
  
  const [form, setForm] = useState<CreatePetData>({
    name: '',
    animal_type: '',
    owner_name: '',
    date_of_birth: ''
  })
  const [errors, setErrors] = useState<Partial<CreatePetData>>({})
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    if (isEdit) {
      fetch(`${API_URL}/pets/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Pet not found')
          return res.json()
        })
        .then((data: Pet) => {
          setForm({
            name: data.name,
            animal_type: data.animal_type,
            owner_name: data.owner_name,
            date_of_birth: data.date_of_birth
          })
          setLoading(false)
        })
        .catch(err => {
          error('Failed to load pet')
          setLoadError(err.message)
          setLoading(false)
        })
    }
  }, [id, isEdit, error])

  const validate = (): boolean => {
    const newErrors: Partial<CreatePetData> = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.animal_type) newErrors.animal_type = 'Animal type is required'
    if (!form.owner_name.trim()) newErrors.owner_name = 'Owner name is required'
    if (!form.date_of_birth) newErrors.date_of_birth = 'Date of birth is required'
    
    const dob = new Date(form.date_of_birth)
    if (dob > new Date()) newErrors.date_of_birth = 'Date cannot be in the future'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setApiError(null)

    const url = isEdit ? `${API_URL}/pets/${id}` : `${API_URL}/pets`
    const method = isEdit ? 'PUT' : 'POST'

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.error) })
        return res.json()
      })
      .then((data: Pet) => {
        success(isEdit ? `${data.name} updated successfully!` : `${data.name} added successfully!`)
        setTimeout(() => navigate(`/pets/${data.id}`), 500)
      })
      .catch(err => {
        setApiError(err.message)
        error(`Failed to ${isEdit ? 'update' : 'add'} pet: ${err.message}`)
        setSubmitting(false)
      })
  }

  const handleChange = (field: keyof CreatePetData, value: string) => {
    setForm({ ...form, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  if (loading) return <Loading />
  if (loadError) return <ErrorDisplay message={loadError} />

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Pet' : 'Add New Pet'}</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Pet Name</label>
            <input
              type="text"
              className="form-input"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Enter pet name"
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Animal Type</label>
            <select
              className="form-select"
              value={form.animal_type}
              onChange={e => handleChange('animal_type', e.target.value)}
            >
              <option value="">Select type</option>
              {ANIMAL_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.animal_type && <div className="form-error">{errors.animal_type}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Owner Name</label>
            <input
              type="text"
              className="form-input"
              value={form.owner_name}
              onChange={e => handleChange('owner_name', e.target.value)}
              placeholder="Enter owner name"
            />
            {errors.owner_name && <div className="form-error">{errors.owner_name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-input"
              value={form.date_of_birth}
              onChange={e => handleChange('date_of_birth', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.date_of_birth && <div className="form-error">{errors.date_of_birth}</div>}
          </div>

          <div className="flex gap-1">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Add Pet')}
            </Button>
            <Link to={isEdit ? `/pets/${id}` : '/pets'}>
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

