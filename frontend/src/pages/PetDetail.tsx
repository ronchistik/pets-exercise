import { useState, useEffect, FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PetWithRecords, CreateRecordData, MedicalRecord } from '../types'
import { API_URL, getAnimalEmoji, formatDate, calculateAge } from '../utils'
import { Button, Card, Badge, Modal, Loading, ErrorDisplay, EmptyState } from '../components'
import { useToast } from '../context/ToastContext'

export default function PetDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [pet, setPet] = useState<PetWithRecords | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [recordFilter, setRecordFilter] = useState('')
  const [showRecordForm, setShowRecordForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null)
  const [recordForm, setRecordForm] = useState<CreateRecordData>({
    record_type: 'vaccine',
    name: '',
    date_administered: '',
    next_due_date: '',
    reactions: '',
    severity: 'mild'
  })

  useEffect(() => {
    fetchPet()
  }, [id])

  const fetchPet = () => {
    fetch(`${API_URL}/pets/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Pet not found')
        return res.json()
      })
      .then((data: PetWithRecords) => {
        setPet(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoadFailed(true)
        showError('Failed to load pet')
        setLoading(false)
      })
  }

  const handleDelete = () => {
    fetch(`${API_URL}/pets/${id}`, { method: 'DELETE' })
      .then(() => {
        success(`${pet?.name} deleted successfully`)
        setTimeout(() => navigate('/pets'), 500)
      })
      .catch(err => {
        setError(err.message)
        showError(err.message)
        setShowDeleteModal(false)
      })
  }

  const handleRecordSubmit = (e: FormEvent) => {
    e.preventDefault()
    const url = editingRecord
      ? `${API_URL}/records/${editingRecord.id}`
      : `${API_URL}/pets/${id}/records`
    const method = editingRecord ? 'PUT' : 'POST'

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recordForm)
    })
      .then(res => {
        if (!res.ok) return res.json().then(data => { throw new Error(data.error) })
        return res.json()
      })
      .then(() => {
        success(editingRecord ? 'Record updated successfully!' : 'Record added successfully!')
        fetchPet()
        resetRecordForm()
      })
      .catch(err => {
        setError(err.message)
        showError(err.message)
      })
  }

  const handleDeleteRecord = (recordId: number) => {
    if (!confirm('Delete this record?')) return
    fetch(`${API_URL}/records/${recordId}`, { method: 'DELETE' })
      .then(() => {
        success('Record deleted successfully!')
        fetchPet()
      })
      .catch(err => {
        setError(err.message)
        showError(err.message)
      })
  }

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record)
    setRecordForm({
      record_type: record.record_type,
      name: record.name,
      date_administered: record.date_administered || '',
      next_due_date: record.next_due_date || '',
      reactions: record.reactions || '',
      severity: record.severity || 'mild'
    })
    setShowRecordForm(true)
  }

  const resetRecordForm = () => {
    setShowRecordForm(false)
    setEditingRecord(null)
    setRecordForm({
      record_type: 'vaccine',
      name: '',
      date_administered: '',
      next_due_date: '',
      reactions: '',
      severity: 'mild'
    })
  }

  const handleExport = () => {
    window.open(`${API_URL}/pets/${id}/export`, '_blank')
  }

  const filteredRecords = pet?.records?.filter(r => 
    !recordFilter || r.record_type === recordFilter
  ) || []

  if (loading) return <Loading />
  if (loadFailed) return <ErrorDisplay message={error || 'Failed to load pet'} />
  if (!pet) return <ErrorDisplay message="Pet not found" />

  return (
    <div>
      <Card>
        <div className="detail-header">
          <div className="detail-avatar">{getAnimalEmoji(pet.animal_type)}</div>
          <div className="detail-info">
            <h1>{pet.name}</h1>
            <div className="detail-meta">
              <span>Patient ID: {pet.id}</span>
              <span>{pet.animal_type}</span>
              <span>Owner: {pet.owner_name}</span>
              <span>Born: {formatDate(pet.date_of_birth)} ({calculateAge(pet.date_of_birth)})</span>
            </div>
          </div>
          <div className="detail-actions">
            <Button variant="secondary" size="sm" onClick={handleExport}>
              Export
            </Button>
            <Link to={`/pets/${id}/edit`}>
              <Button variant="secondary" size="sm">Edit</Button>
            </Link>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
              Delete
            </Button>
          </div>
        </div>
      </Card>

      <div className="section mt-2">
        <div className="section-header">
          <h2 className="section-title">Medical Records</h2>
          <div className="flex gap-1">
            <select
              className="form-select"
              value={recordFilter}
              onChange={e => setRecordFilter(e.target.value)}
              style={{ minWidth: '120px' }}
            >
              <option value="">All Types</option>
              <option value="vaccine">Vaccines</option>
              <option value="allergy">Allergies</option>
            </select>
            <Button size="sm" onClick={() => setShowRecordForm(true)}>
              + Add Record
            </Button>
          </div>
        </div>

        {showRecordForm && (
          <div className="record-form card">
            <form onSubmit={handleRecordSubmit}>
              <div className="record-form-row">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={recordForm.record_type}
                    onChange={e => setRecordForm({ ...recordForm, record_type: e.target.value as 'vaccine' | 'allergy' })}
                  >
                    <option value="vaccine">Vaccine</option>
                    <option value="allergy">Allergy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={recordForm.name}
                    onChange={e => setRecordForm({ ...recordForm, name: e.target.value })}
                    required
                  />
                </div>
                {recordForm.record_type === 'vaccine' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Date Administered</label>
                      <input
                        type="date"
                        className="form-input"
                        value={recordForm.date_administered}
                        onChange={e => setRecordForm({ ...recordForm, date_administered: e.target.value })}
                        placeholder="Leave empty for planned vaccines"
                      />
                      <small style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Leave empty if not yet given</small>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Due Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={recordForm.next_due_date}
                        onChange={e => setRecordForm({ ...recordForm, next_due_date: e.target.value })}
                      />
                      <small style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>When this vaccine is due/scheduled</small>
                    </div>
                  </>
                )}
                {recordForm.record_type === 'allergy' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Reactions</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., hives, rash"
                        value={recordForm.reactions}
                        onChange={e => setRecordForm({ ...recordForm, reactions: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Severity</label>
                      <select
                        className="form-select"
                        value={recordForm.severity}
                        onChange={e => setRecordForm({ ...recordForm, severity: e.target.value as 'mild' | 'severe' })}
                      >
                        <option value="mild">Mild</option>
                        <option value="severe">Severe</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-1">
                <Button type="submit" size="sm">
                  {editingRecord ? 'Update' : 'Add'} Record
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={resetRecordForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {filteredRecords.length === 0 ? (
          <EmptyState message="No medical records yet." />
        ) : (
          <Card>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Details</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map(record => (
                    <tr key={record.id}>
                      <td>
                        <Badge variant={record.record_type}>
                          {record.record_type}
                        </Badge>
                      </td>
                      <td>{record.name}</td>
                      <td>
                        {record.record_type === 'vaccine' && (
                          <span>
                            {!record.date_administered && record.next_due_date && (
                              <><strong style={{ color: 'var(--warning)' }}>Planned:</strong> {formatDate(record.next_due_date)}</>
                            )}
                            {record.date_administered && !record.next_due_date && (
                              <>Given: {formatDate(record.date_administered)}</>
                            )}
                            {record.date_administered && record.next_due_date && (
                              <>Given: {formatDate(record.date_administered)} • Due: {formatDate(record.next_due_date)}</>
                            )}
                            {!record.date_administered && !record.next_due_date && '-'}
                          </span>
                        )}
                        {record.record_type === 'allergy' && (
                          <span>
                            {record.reactions && `${record.reactions} • `}
                            <Badge variant={record.severity!}>{record.severity}</Badge>
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <Button variant="secondary" size="sm" onClick={() => handleEditRecord(record)}>
                            Edit
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {showDeleteModal && (
        <Modal
          title="Delete Pet?"
          message={`Are you sure you want to delete ${pet.name}? This will also delete all medical records.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  )
}

