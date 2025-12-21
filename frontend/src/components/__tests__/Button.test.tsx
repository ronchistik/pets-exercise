import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByText('Click me'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByText('Primary')).toHaveClass('btn-primary')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByText('Secondary')).toHaveClass('btn-secondary')

    rerender(<Button variant="danger">Danger</Button>)
    expect(screen.getByText('Danger')).toHaveClass('btn-danger')
  })

  it('should apply size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByText('Small')).toHaveClass('btn-sm')

    rerender(<Button size="md">Medium</Button>)
    const mediumButton = screen.getByText('Medium')
    expect(mediumButton).toHaveClass('btn')
    expect(mediumButton).not.toHaveClass('btn-sm')
  })

  it('should render as button element', () => {
    render(<Button>Default</Button>)
    const button = screen.getByText('Default')
    expect(button.tagName).toBe('BUTTON')
  })

  it('should support submit type', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByText('Submit')).toHaveAttribute('type', 'submit')
  })

  it('should apply default variant when not specified', () => {
    render(<Button>Default</Button>)
    const button = screen.getByText('Default')
    expect(button).toHaveClass('btn-primary')
    expect(button).not.toHaveClass('btn-sm')
  })

  it('should pass through additional props', () => {
    render(<Button disabled data-testid="custom-btn">Disabled</Button>)
    const button = screen.getByTestId('custom-btn')
    expect(button).toBeDisabled()
  })
})
