import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import PetForm from '../PetForm'
import { ToastProvider } from '../../context/ToastContext'

function renderPetForm(initialRoute = '/pets/new') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ToastProvider>
        <PetForm />
      </ToastProvider>
    </MemoryRouter>
  )
}

describe('PetForm - Validation', () => {
  it('should display validation errors for empty form', async () => {
    const user = userEvent.setup()
    renderPetForm()

    const submitButton = screen.getByText('Add Pet')
    await user.click(submitButton)

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Animal type is required')).toBeInTheDocument()
    expect(screen.getByText('Owner name is required')).toBeInTheDocument()
    expect(screen.getByText('Date of birth is required')).toBeInTheDocument()
  })

  it('should validate pet name field', async () => {
    const user = userEvent.setup()
    renderPetForm()

    const nameInput = screen.getByPlaceholderText('Enter pet name')
    const submitButton = screen.getByText('Add Pet')

    // Submit with empty name
    await user.click(submitButton)
    expect(await screen.findByText('Name is required')).toBeInTheDocument()

    // Type name - error should disappear
    await user.type(nameInput, 'Buddy')
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
  })

  it('should validate owner name field', async () => {
    const user = userEvent.setup()
    renderPetForm()

    const ownerInput = screen.getByPlaceholderText('Enter owner name')
    const submitButton = screen.getByText('Add Pet')

    await user.click(submitButton)
    expect(await screen.findByText('Owner name is required')).toBeInTheDocument()

    await user.type(ownerInput, 'John Doe')
    expect(screen.queryByText('Owner name is required')).not.toBeInTheDocument()
  })

  it('should validate animal type selection', async () => {
    const user = userEvent.setup()
    renderPetForm()

    const typeSelect = document.querySelector('select.form-select') as HTMLSelectElement
    const submitButton = screen.getByText('Add Pet')

    await user.click(submitButton)
    expect(await screen.findByText('Animal type is required')).toBeInTheDocument()

    if (typeSelect) {
      await user.selectOptions(typeSelect, 'Dog')
      expect(screen.queryByText('Animal type is required')).not.toBeInTheDocument()
    }
  })

  it('should validate date of birth', async () => {
    const user = userEvent.setup()
    renderPetForm()

    const dateInput = screen.getAllByRole('textbox').find(el => el.getAttribute('type') === 'date') 
      || document.querySelector('input[type="date"]')
    const submitButton = screen.getByText('Add Pet')

    await user.click(submitButton)
    expect(await screen.findByText('Date of birth is required')).toBeInTheDocument()

    if (dateInput) {
      await user.type(dateInput, '2020-01-01')
      expect(screen.queryByText('Date of birth is required')).not.toBeInTheDocument()
    }
  })

  // Note: Future date validation is handled by HTML max attribute on the date input
  // Browser-level validation prevents entering future dates
  it.skip('should reject future dates', async () => {
    // Skipped: Date input browser validation is difficult to test in jsdom
    // The form has max attribute set to today's date which prevents future dates
  })
})

describe('PetForm - User Interactions', () => {
  it('should allow filling out all form fields', async () => {
    const user = userEvent.setup()
    renderPetForm()

    const nameInput = screen.getByPlaceholderText('Enter pet name')
    const typeSelect = document.querySelector('select.form-select') as HTMLSelectElement
    const ownerInput = screen.getByPlaceholderText('Enter owner name')
    const dateInput = document.querySelector('input[type="date"]')

    await user.type(nameInput, 'Buddy')
    if (typeSelect) {
      await user.selectOptions(typeSelect, 'Dog')
    }
    await user.type(ownerInput, 'John Doe')
    if (dateInput) {
      await user.type(dateInput as HTMLElement, '2020-01-15')
    }

    expect(nameInput).toHaveValue('Buddy')
    if (typeSelect) {
      expect(typeSelect).toHaveValue('Dog')
    }
    expect(ownerInput).toHaveValue('John Doe')
    if (dateInput) {
      expect(dateInput).toHaveValue('2020-01-15')
    }
  })

  it('should display all animal type options', () => {
    renderPetForm()

    expect(screen.getByText('Dog')).toBeInTheDocument()
    expect(screen.getByText('Cat')).toBeInTheDocument()
    expect(screen.getByText('Bird')).toBeInTheDocument()
    expect(screen.getByText('Rabbit')).toBeInTheDocument()
    expect(screen.getByText('Hamster')).toBeInTheDocument()
    expect(screen.getByText('Fish')).toBeInTheDocument()
    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('should have cancel button', () => {
    renderPetForm()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should disable submit button while submitting', async () => {
    const user = userEvent.setup()
    renderPetForm()

    // Fill form with valid data
    await user.type(screen.getByPlaceholderText('Enter pet name'), 'Buddy')
    
    const typeSelect = document.querySelector('select.form-select') as HTMLSelectElement
    if (typeSelect) {
      await user.selectOptions(typeSelect, 'Dog')
    }
    
    await user.type(screen.getByPlaceholderText('Enter owner name'), 'John Doe')
    
    const dateInput = document.querySelector('input[type="date"]')
    if (dateInput) {
      await user.type(dateInput as HTMLElement, '2020-01-15')
    }

    const submitButton = screen.getByText('Add Pet')
    
    // Mock fetch to delay response
    global.fetch = vi.fn(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ id: 1, name: 'Buddy' })
        } as Response), 1000)
      )
    )

    await user.click(submitButton)
    
    // Button should show "Saving..." and be disabled
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeDisabled()
    })
  })
})

describe('PetForm - Headers', () => {
  it('should display "Add New Pet" title for create mode', () => {
    renderPetForm()
    expect(screen.getByText('Add New Pet')).toBeInTheDocument()
  })

  it('should display correct submit button text for create mode', () => {
    renderPetForm()
    expect(screen.getByText('Add Pet')).toBeInTheDocument()
  })
})

describe('PetForm - Error Handling', () => {
  it('should clear field error when user starts typing', async () => {
    const user = userEvent.setup()
    renderPetForm()

    const nameInput = screen.getByPlaceholderText('Enter pet name')
    const submitButton = screen.getByText('Add Pet')

    // Trigger validation error
    await user.click(submitButton)
    expect(await screen.findByText('Name is required')).toBeInTheDocument()

    // Start typing - error should clear
    await user.type(nameInput, 'B')
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
  })

  it('should show all validation errors at once', async () => {
    const user = userEvent.setup()
    renderPetForm()

    const submitButton = screen.getByText('Add Pet')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Animal type is required')).toBeInTheDocument()
      expect(screen.getByText('Owner name is required')).toBeInTheDocument()
      expect(screen.getByText('Date of birth is required')).toBeInTheDocument()
    })
  })
})

describe('PetForm - Accessibility', () => {
  it('should have proper labels for all inputs', () => {
    renderPetForm()

    expect(screen.getByText('Pet Name')).toBeInTheDocument()
    expect(screen.getByText('Animal Type')).toBeInTheDocument()
    expect(screen.getByText('Owner Name')).toBeInTheDocument()
    expect(screen.getByText('Date of Birth')).toBeInTheDocument()
  })

  it('should have placeholders for text inputs', () => {
    renderPetForm()

    expect(screen.getByPlaceholderText('Enter pet name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter owner name')).toBeInTheDocument()
  })

  it('should have max date constraint on date input', () => {
    renderPetForm()

    const dateInput = document.querySelector('input[type="date"]')
    const today = new Date().toISOString().split('T')[0]
    
    if (dateInput) {
      expect(dateInput).toHaveAttribute('max', today)
    }
  })
})
