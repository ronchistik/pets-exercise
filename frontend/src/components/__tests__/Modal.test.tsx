import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '../Modal'

describe('Modal', () => {
  const defaultProps = {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  it('should render title and message', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
  })

  it('should render default button texts', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should render custom button texts', () => {
    render(
      <Modal 
        {...defaultProps}
        confirmText="Delete"
        cancelText="Go Back"
      />
    )
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Go Back')).toBeInTheDocument()
  })

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    
    render(<Modal {...defaultProps} onConfirm={onConfirm} />)
    await user.click(screen.getByText('Confirm'))
    
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    
    render(<Modal {...defaultProps} onCancel={onCancel} />)
    await user.click(screen.getByText('Cancel'))
    
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should have modal-overlay class on container', () => {
    const { container } = render(<Modal {...defaultProps} />)
    expect(container.querySelector('.modal-overlay')).toBeInTheDocument()
  })

  it('should have modal class on content', () => {
    const { container } = render(<Modal {...defaultProps} />)
    expect(container.querySelector('.modal')).toBeInTheDocument()
  })

  it('should render confirm button as danger variant', () => {
    render(<Modal {...defaultProps} />)
    const confirmButton = screen.getByText('Confirm')
    expect(confirmButton).toHaveClass('btn-danger')
  })

  it('should render cancel button as secondary variant', () => {
    render(<Modal {...defaultProps} />)
    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toHaveClass('btn-secondary')
  })
})
