import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getAnimalEmoji, formatDate, calculateAge } from '../utils'

describe('getAnimalEmoji', () => {
  it('should return correct emoji for known animal types', () => {
    expect(getAnimalEmoji('dog')).toBe('🐕')
    expect(getAnimalEmoji('cat')).toBe('🐱')
    expect(getAnimalEmoji('bird')).toBe('🐦')
    expect(getAnimalEmoji('rabbit')).toBe('🐰')
    expect(getAnimalEmoji('hamster')).toBe('🐹')
    expect(getAnimalEmoji('fish')).toBe('🐠')
  })

  it('should be case insensitive', () => {
    expect(getAnimalEmoji('DOG')).toBe('🐕')
    expect(getAnimalEmoji('Cat')).toBe('🐱')
    expect(getAnimalEmoji('BIRD')).toBe('🐦')
  })

  it('should return default emoji for unknown animal types', () => {
    expect(getAnimalEmoji('elephant')).toBe('🐾')
    expect(getAnimalEmoji('unknown')).toBe('🐾')
    expect(getAnimalEmoji('')).toBe('🐾')
  })

  it('should handle null or undefined input', () => {
    expect(getAnimalEmoji(null as any)).toBe('🐾')
    expect(getAnimalEmoji(undefined as any)).toBe('🐾')
  })
})

describe('formatDate', () => {
  it('should format valid date strings', () => {
    const date = '2024-01-15'
    const formatted = formatDate(date)
    expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
  })

  it('should return "-" for null date', () => {
    expect(formatDate(null)).toBe('-')
  })

  it('should handle ISO date strings', () => {
    const isoDate = '2024-01-15T10:30:00.000Z'
    const formatted = formatDate(isoDate)
    expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
  })
})

describe('calculateAge', () => {
  beforeEach(() => {
    // Mock the current date to be consistent
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-12-18'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should calculate age in years for pets older than 1 year', () => {
    expect(calculateAge('2022-12-18')).toBe('2 years')
    expect(calculateAge('2020-12-18')).toBe('4 years')
  })

  it('should return "1 year" for exactly 1 year old', () => {
    expect(calculateAge('2023-12-18')).toBe('1 year')
  })

  it('should return months for pets less than 1 year old', () => {
    expect(calculateAge('2024-06-18')).toBe('6 months')
    expect(calculateAge('2024-11-18')).toBe('1 months')
  })

  it('should handle newborn pets (0 months)', () => {
    expect(calculateAge('2024-12-18')).toBe('0 months')
  })

  it('should handle past dates correctly', () => {
    // From 2024-12-18 to 2019-01-01 is 5 years, but since Dec > Jan, it's actually 6 years
    expect(calculateAge('2019-01-01')).toBe('6 years')
  })
})
