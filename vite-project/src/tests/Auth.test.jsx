import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Auth from '../components/Auth';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { supabase } from '/supabaseClient';

vi.mock('/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  },
}));

describe('Auth component', () => {
  it('renders the login form correctly', () => {
    render(
      <MemoryRouter>
        <Auth setIsAuthenticated={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  it('toggles between login and signup', () => {
    render(
      <MemoryRouter>
        <Auth setIsAuthenticated={vi.fn()} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Sign Up'));
    expect(screen.getByText('Sign up')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Log In'));
    expect(screen.getByText('Log in')).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockSetIsAuthenticated = vi.fn();
    supabase.auth.signInWithPassword.mockResolvedValueOnce({ error: null });
    
    render(
      <MemoryRouter>
        <Auth setIsAuthenticated={mockSetIsAuthenticated} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'vava@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Log In'));

    await waitFor(() => expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'vava@example.com',
      password: 'password',
    }));

    await waitFor(() => expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true));
  });

 
});
