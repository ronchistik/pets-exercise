import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Stats } from '../types'
import { API_URL, getAnimalEmoji, formatDate } from '../utils'
import { Button, Card, StatCard, Loading, ErrorDisplay } from '../components'
import { useToast } from '../context/ToastContext'

export default function Dashboard() {
  const { error: showError } = useToast()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        showError('Failed to load dashboard data')
        setLoading(false)
      })
  }, [])

  if (loading) return <Loading />
  if (error) return <ErrorDisplay message={error} />
  if (!stats) return <ErrorDisplay message="No data available" />

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <Link to="/pets/new">
          <Button>+ Add Pet</Button>
        </Link>
      </div>

      <div className="grid grid-4 mb-2">
        <StatCard value={stats.totalPets} label="Total Pets" />
        <StatCard value={stats.totalVaccines} label="Vaccines Recorded" />
        <StatCard value={stats.totalAllergies} label="Allergies Tracked" />
        <StatCard value={stats.severeAllergies?.length || 0} label="Severe Allergy Patients" />
      </div>

      <div className="grid grid-2">
        <Card>
          <h2 className="section-title mb-1">Pets by Type</h2>
          {stats.petsByType?.length > 0 ? (
            <div>
              {stats.petsByType.map(item => (
                <div 
                  key={item.animal_type} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '0.5rem 0', 
                    borderBottom: '1px solid var(--border)' 
                  }}
                >
                  <span>{getAnimalEmoji(item.animal_type)} {item.animal_type}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center" style={{ color: 'var(--text-light)' }}>No pets yet</p>
          )}
        </Card>

        <Card>
          <h2 className="section-title mb-1">📅 Upcoming Vaccines</h2>
          {stats.upcomingVaccines?.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Pet</th>
                    <th>Vaccine</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.upcomingVaccines.map(vaccine => (
                    <tr key={vaccine.id}>
                      <td>
                        <Link to={`/pets/${vaccine.pet_id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                          {vaccine.pet_name}
                        </Link>
                      </td>
                      <td>{vaccine.name}</td>
                      <td>{formatDate(vaccine.next_due_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center" style={{ color: 'var(--text-light)', padding: '1rem 0' }}>All vaccines up to date!</p>
          )}
        </Card>
      </div>

      {stats.severeAllergies?.length > 0 && (
        <Card className="mt-2">
          <h2 className="section-title mb-1">⚠️ Severe Allergies Alert</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>Allergies</th>
                  <th>Reactions</th>
                </tr>
              </thead>
              <tbody>
                {stats.severeAllergies.map(item => (
                  <tr key={item.pet_id}>
                    <td>
                      <Link to={`/pets/${item.pet_id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                        {item.pet_name}
                      </Link>
                    </td>
                    <td>
                      {item.allergies.map(a => a.name).join(', ')}
                    </td>
                    <td>
                      {item.allergies.filter(a => a.reactions).map(a => a.reactions).join('; ') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

