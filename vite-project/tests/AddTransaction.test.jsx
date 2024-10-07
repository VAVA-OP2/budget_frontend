import React from 'react';
import { it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddTransaction from '../src/components/AddTransaction';
import { MemoryRouter } from 'react-router-dom';

describe('AddTransaction', () => {

    it('päivittää tulon syöttökentän arvon', () => {
        const mockState = {
            userInfo: { id: 1 },
            categories: []
        };

        // Käytä MemoryRouteria testissä ja aseta mockState simuloimaan useLocation hookia
        render(
            <MemoryRouter initialEntries={[{ state: mockState }]}>
                <AddTransaction />
            </MemoryRouter>
        );

        // Etsi tulon syöttökenttä placeholderin perusteella
        const incomeInput = screen.getByPlaceholderText('Enter your income amount');

        // Varmista, että kenttä on aluksi tyhjä
        expect(incomeInput.value).toBe('');

        // Simuloidaan käyttäjän syöttämä arvo tulon syöttökenttään
        fireEvent.change(incomeInput, { target: { value: '100' } });

        // Varmistetaan, että syöttökentän arvo on päivitetty oikein
        expect(incomeInput.value).toBe('100');
    });
});
