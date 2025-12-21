import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../Badge'

describe('Badge', () => {
  it('should render with text', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('should apply variant classes', () => {
    const { rerender } = render(<Badge variant="vaccine">Vaccine</Badge>)
    expect(screen.getByText('Vaccine')).toHaveClass('badge-vaccine')

    rerender(<Badge variant="allergy">Allergy</Badge>)
    expect(screen.getByText('Allergy')).toHaveClass('badge-allergy')

    rerender(<Badge variant="mild">Mild</Badge>)
    expect(screen.getByText('Mild')).toHaveClass('badge-mild')

    rerender(<Badge variant="severe">Severe</Badge>)
    expect(screen.getByText('Severe')).toHaveClass('badge-severe')
  })

  it('should render with required variant', () => {
    render(<Badge variant="vaccine">Required Variant</Badge>)
    expect(screen.getByText('Required Variant')).toHaveClass('badge-vaccine')
  })

  it('should have base badge class', () => {
    render(<Badge>Test</Badge>)
    expect(screen.getByText('Test')).toHaveClass('badge')
  })
})
