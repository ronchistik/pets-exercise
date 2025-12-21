import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from '../ToastContext'

// Test component that uses the toast context
function TestComponent() {
  const { toasts, success, error, info, removeToast } = useToast()

  return (
    <div>
      <button onClick={() => success('Success message')}>Show Success</button>
      <button onClick={() => error('Error message')}>Show Error</button>
      <button onClick={() => info('Info message')}>Show Info</button>
      <div data-testid="toast-count">{toasts.length}</div>
      <ul>
        {toasts.map(toast => (
          <li key={toast.id} data-testid={`toast-${toast.type}`}>
            {toast.message}
            <button onClick={() => removeToast(toast.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

describe('ToastContext', () => {
  it('should throw error when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useToast must be used within ToastProvider')
    
    spy.mockRestore()
  })

  it('should provide toast functions to children', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    expect(screen.getByText('Show Success')).toBeInTheDocument()
    expect(screen.getByText('Show Error')).toBeInTheDocument()
    expect(screen.getByText('Show Info')).toBeInTheDocument()
  })

  it('should add success toast when success is called', async () => {
    const user = userEvent.setup()
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Success'))
    
    expect(screen.getByTestId('toast-success')).toBeInTheDocument()
    expect(screen.getByText('Success message')).toBeInTheDocument()
  })

  it('should add error toast when error is called', async () => {
    const user = userEvent.setup()
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Error'))
    
    expect(screen.getByTestId('toast-error')).toBeInTheDocument()
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('should add info toast when info is called', async () => {
    const user = userEvent.setup()
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Info'))
    
    expect(screen.getByTestId('toast-info')).toBeInTheDocument()
    expect(screen.getByText('Info message')).toBeInTheDocument()
  })

  it('should allow multiple toasts to be displayed', async () => {
    const user = userEvent.setup()
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Success'))
    await user.click(screen.getByText('Show Error'))
    await user.click(screen.getByText('Show Info'))
    
    expect(screen.getByTestId('toast-count')).toHaveTextContent('3')
  })

  it('should remove toast when removeToast is called', async () => {
    const user = userEvent.setup()
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Success'))
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1')

    const removeButton = screen.getByText('Remove')
    await user.click(removeButton)
    
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
  })

  it('should maintain toast order', async () => {
    const user = userEvent.setup()
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Success'))
    await user.click(screen.getByText('Show Error'))
    
    const toasts = screen.getAllByRole('listitem')
    expect(toasts[0]).toHaveTextContent('Success message')
    expect(toasts[1]).toHaveTextContent('Error message')
  })
})
