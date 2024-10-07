// npm run test
// https://vitest.dev/guide/

import { test, vi, expect, afterEach } from 'vitest';
import { resetIncome, resetExpense } from '../src/components/Reset.jsx' 

// Mockataan supabase-kutsu
vi.mock('/supabaseClient', () => ({
  supabase: {
    from: () => ({
      delete: () => ({
        eq: () => ({ error: null }), // Mockataan onnistunut poisto
      }),
    }),
  },
}));

// Mockataan selaimen confirm ja alert
global.confirm = vi.fn();
global.alert = vi.fn();

// Nollataan mockit jokaisen testin jälkeen
afterEach(() => {
  vi.clearAllMocks();
});

test('resetIncome kutsuu supabase ja näyttää ilmoituksen kun kayttaja on vahvistanut nollauksen', async () => {
  confirm.mockReturnValue(true); // Simuloidaan käyttäjän hyväksyntä

  await resetIncome({ id: 1 });

  expect(confirm).toHaveBeenCalledWith("Are you sure you want to delete all income? This action cannot be reversed.");
  expect(alert).toHaveBeenCalledWith("All income has been successfully deleted!");
});



test('resetIncome ei tee mitään kun vahvistusta ei anneta', async () => {
  confirm.mockReturnValue(false); // Simuloidaan käyttäjän hylkäys

  await resetIncome({ id: 1 });

  expect(confirm).toHaveBeenCalledWith("Are you sure you want to delete all income? This action cannot be reversed.");
  expect(alert).not.toHaveBeenCalled(); // Ei pitäis näyttää mitään alerttia kun kayttaja painaa peru alertissa.
});

// --------------------------------------------------------------------------------------------------------------------------//

test('resetExpense kutsuu supabase ja näyttää ilmoituksen kun vahvistettu', async () => {
  confirm.mockReturnValue(true); // Simuloidaan käyttäjän hyväksyntä

  await resetExpense({ id: 1 });

  expect(confirm).toHaveBeenCalledWith("Are you sure you want to delete all expenses? This action cannot be reversed.");
  expect(alert).toHaveBeenCalledWith("All expenses have been successfully deleted!");
});



test('resetExpense ei tee mitään kun vahvistusta ei anneta', async () => {
  confirm.mockReturnValue(false); // Simuloidaan käyttäjän hylkäys

  await resetExpense({ id: 1 });

  expect(confirm).toHaveBeenCalledWith("Are you sure you want to delete all expenses? This action cannot be reversed.");
  expect(alert).not.toHaveBeenCalled(); // Ei pitäisi näyttää mitään alerttia
});
