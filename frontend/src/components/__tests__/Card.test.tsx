import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '../Card'

describe('Card', () => {
  it('should render children', () => {
    render(
      <Card>
        <h1>Card Title</h1>
        <p>Card content</p>
      </Card>
    )
    
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('should have card class', () => {
    render(<Card><div data-testid="content">Content</div></Card>)
    const card = screen.getByTestId('content').parentElement
    expect(card).toHaveClass('card')
  })

  it('should support custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>)
    const card = container.querySelector('.card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('card')
    expect(card).toHaveClass('custom-class')
  })
})
