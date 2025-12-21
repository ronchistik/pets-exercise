import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from '../StatCard'

describe('StatCard', () => {
  it('should render value and label', () => {
    render(<StatCard value={42} label="Total Pets" />)
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Total Pets')).toBeInTheDocument()
  })

  it('should render value with correct class', () => {
    render(<StatCard value={100} label="Vaccines" />)
    expect(screen.getByText('100')).toHaveClass('stat-value')
  })

  it('should render label with correct class', () => {
    render(<StatCard value={50} label="Allergies" />)
    expect(screen.getByText('Allergies')).toHaveClass('stat-label')
  })

  it('should render zero value', () => {
    render(<StatCard value={0} label="No Data" />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should render large numbers', () => {
    render(<StatCard value={9999} label="Big Number" />)
    expect(screen.getByText('9999')).toBeInTheDocument()
  })
})
