import { render, screen, act } from '@testing-library/react';
import Calculations from '../components/Calculations';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { supabase } from '/supabaseClient';

// Mockataan `supabaseClient` kokonaisuudessaan
vi.mock('/supabaseClient', () => ({
  supabase: {
    from: (table) => ({
      select: () => ({
        eq: vi.fn().mockResolvedValue(
          table === 'income'
            ? { data: [{ amount: 100 }, { amount: 200 }], error: null } // Mockatut tulot
            : { data: [{ amount: 50 }, { amount: 150 }], error: null } // Mockatut kulut
        ),
      }),
    }),
  },
}));

describe('Calculations component', () => {
  it('should calculate total income correctly', async () => {
    // Renderöidään komponentti `MemoryRouter`-kääreessä
    render(
      <MemoryRouter>
        <Calculations userInfo={{ id: 'test_user' }} categories={[]} />
      </MemoryRouter>
    );

    // Tarkistetaan laskettu tulo
    expect(await screen.findByText('Total Income: 300 €')).toBeInTheDocument();
  });

  it('should calculate total expense correctly', async () => {
    // Renderöidään komponentti
    render(
      <MemoryRouter>
        <Calculations userInfo={{ id: 'test_user' }} categories={[]} />
      </MemoryRouter>
    );

    // Tarkistetaan laskettu kulu
    expect(await screen.findByText('Total Expense: 200 €')).toBeInTheDocument();
  });


});
it('should calculate balance correctly', async () => {
  render(
    <MemoryRouter>
      <Calculations userInfo={{ id: 'test_user' }} categories={[]} />
    </MemoryRouter>
  );

  
  await screen.findByText('Total Income: 300 €');
  await screen.findByText('Total Expense: 200 €');

  // Tarkistetaan saldo
  expect(screen.getByText('Balance: 100 €')).toBeInTheDocument();
});
