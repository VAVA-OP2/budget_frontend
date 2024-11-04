import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddTransaction from '../components/AddTransaction';
import { supabase } from '/supabaseClient';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mockataan supabase ja useLocation
const insertSpy = vi.fn().mockResolvedValue({ data: {}, error: null });
vi.mock('/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: insertSpy,
    })),
  },
}));

vi.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => <div>{children}</div>,
  useLocation: () => ({
    state: {
      userInfo: { id: 'test-user-id' },
      categories: [{ categoryid: '1', categoryname: 'Food', categoryLimit: 100 }],
    },
  }),
}));

describe('AddTransaction component - Income tests', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows error for invalid income amount', () => {
    render(
      <MemoryRouter>
        <AddTransaction />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter your income amount'), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Income' }));

    expect(window.alert).toHaveBeenCalledWith('Please enter a valid number for income.');
  });
});
