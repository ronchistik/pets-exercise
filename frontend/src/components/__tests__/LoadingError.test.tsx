import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Loading, ErrorDisplay, EmptyState } from '../LoadingError'

describe('Loading', () => {
  it('should render loading text', () => {
    render(<Loading />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should have loading class', () => {
    render(<Loading />)
    expect(screen.getByText('Loading...')).toHaveClass('loading')
  })
})

describe('ErrorDisplay', () => {
  it('should render error message', () => {
    render(<ErrorDisplay message="Something went wrong" />)
    expect(screen.getByText('Error: Something went wrong')).toBeInTheDocument()
  })

  it('should have error class', () => {
    render(<ErrorDisplay message="Test error" />)
    expect(screen.getByText(/Test error/)).toHaveClass('error')
  })
})

describe('EmptyState', () => {
  it('should render message', () => {
    render(<EmptyState message="No items found" />)
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('should render default icon', () => {
    render(<EmptyState message="Empty" />)
    expect(screen.getByText('🐾')).toBeInTheDocument()
  })

  it('should render custom icon', () => {
    render(<EmptyState icon="📝" message="No records" />)
    expect(screen.getByText('📝')).toBeInTheDocument()
  })

  it('should render action when provided', () => {
    render(
      <EmptyState 
        message="No pets" 
        action={<button>Add Pet</button>}
      />
    )
    expect(screen.getByText('Add Pet')).toBeInTheDocument()
  })

  it('should not render action section when not provided', () => {
    const { container } = render(<EmptyState message="Empty" />)
    expect(container.querySelector('.mt-1')).not.toBeInTheDocument()
  })
})
