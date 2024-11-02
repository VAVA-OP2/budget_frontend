import { resetIncome, resetExpense } from '../components/Reset';
import { vi } from 'vitest';
import { supabase } from '/supabaseClient';

// Mockataan `alert`, `confirm` ja `supabase`
global.confirm = vi.fn();
global.alert = vi.fn();

// Mockataan `supabaseClient`, jotta voidaan tarkistaa kutsut ilman yhteyttä tietokantaan
vi.mock('/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(), // Sallii ketjutetut kutsut, esim. `from().delete()`
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ error: null }), // Mockataan onnistunut poisto ilman virhettä
  },
}));

// Käyttäjän tunnistetiedot, joita tarvitaan tietojen poistamiseen
const userInfo = { id: 'test_user' };

describe('resetIncome function', () => {
  it('should confirm before deleting income data', async () => {
    global.confirm.mockReturnValueOnce(true); //käyttäjä painaa ok
    await resetIncome(userInfo);
    expect(global.confirm).toHaveBeenCalledWith("Are you sure you want to delete all income? This action cannot be reversed.");
  });

  it('should delete income data if confirmed', async () => {
    global.confirm.mockReturnValueOnce(true); //käyttäjä painaa ok
    await resetIncome(userInfo);
    expect(supabase.from).toHaveBeenCalledWith('income');
    expect(supabase.delete).toHaveBeenCalled();
  });
});

// Uusi describe-lohko `resetExpense`-funktiolle
describe('resetExpense function', () => {
  it('should confirm before deleting expense data', async () => {
    global.confirm.mockReturnValueOnce(true);
    await resetExpense(userInfo);
    expect(global.confirm).toHaveBeenCalledWith("Are you sure you want to delete all expenses? This action cannot be reversed.");
  });

  it('should delete expense data if confirmed', async () => {
    // Mockataan vahvistusikkuna näyttämään hyväksyntä (true)
    global.confirm.mockReturnValueOnce(true);

    // Kutsutaan resetExpense-funktiota käyttäjän tiedoilla
    await resetExpense(userInfo);

    // Tarkistetaan, että `supabase.from`-funktiota on kutsuttu `expense`-taulun kanssa
    expect(supabase.from).toHaveBeenCalledWith('expense');

    // Varmistetaan, että `delete`-funktiota kutsutaan poistamaan tietoja
    expect(supabase.delete).toHaveBeenCalled();
  });
});
