import { render, screen, act } from '@testing-library/react';
import Calculations from '../components/Calculations';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { supabase } from '/supabaseClient';

// Mockataan `supabaseClient` kokonaisuudessaan
vi.mock('/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: vi.fn().mockResolvedValue({ data: [{ amount: 100 }, { amount: 200 }], error: null }) // Mockatut tulot
      })
    })
  }
}));

describe('Calculations component', () => {
  it('should calculate total income correctly', async () => {
    // Renderöidään komponentti `MemoryRouter`-kääreessä -- React Router navigointi testeihin ei muuta selaimen url, esim usenavigate ei toimi testeissä
    render(
      <MemoryRouter>
        <Calculations userInfo={{ id: 'test_user' }} categories={[]} />
      </MemoryRouter>
    );

    // Käytetään `findByText` odottamaan päivitystä
    expect(await screen.findByText('Total Income: 300 €')).toBeInTheDocument(); // Tarkistetaan laskettu tulo
  });
});
