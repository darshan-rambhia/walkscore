import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AddressSearch from '../../components/AddressSearch';

// Helper to control async resolution for geocode
function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

const geocodeDeferred = createDeferred<any>();

// Mock the services with controlled async behavior
vi.mock('../../services/location', () => ({
  geocodeAddress: vi.fn(() => geocodeDeferred.promise),
  fetchAmenities: vi.fn(() => Promise.resolve([]))
}));

vi.mock('../../services/scoring', () => ({
  computeScores: vi.fn()
}));

vi.mock('../../services/history', () => ({
  addHistoryEntry: vi.fn()
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function TestWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe('AddressSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search form', () => {
    render(
      <TestWrapper>
        <AddressSearch />
      </TestWrapper>
    );
    
    expect(screen.getByLabelText('Street address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('should update input value when user types', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AddressSearch />
      </TestWrapper>
    );
    
    const input = screen.getByLabelText('Street address');
    
    await user.type(input, 'New York');
    expect(input).toHaveValue('New York');
  });

  it('should show loading state when form is submitted', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AddressSearch />
      </TestWrapper>
    );
    
    const input = screen.getByLabelText('Street address');
    const button = screen.getByRole('button', { name: 'Search' });
    
    await user.type(input, 'Test Address');
    await user.click(button);

    // Assert immediate loading state (geocode promise unresolved yet)
    expect(screen.getByText('Searching…')).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(input).toBeDisabled();

    // Resolve geocode to avoid test leaking unresolved promise
    geocodeDeferred.resolve({
      lat: 0,
      lon: 0,
      displayName: 'Resolved Address'
    });
  });

  it('should have proper placeholder text', () => {
    render(
      <TestWrapper>
        <AddressSearch />
      </TestWrapper>
    );
    
    const input = screen.getByLabelText('Street address');
    expect(input).toHaveAttribute('placeholder', 'Enter a street address');
  });

  it('should have proper form accessibility', () => {
    render(
      <TestWrapper>
        <AddressSearch />
      </TestWrapper>
    );
    
    const form = screen.getByLabelText('Address search form');
    expect(form).toBeInTheDocument();
  });
});