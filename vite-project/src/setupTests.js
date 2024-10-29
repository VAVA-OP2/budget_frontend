// src/setupTests.js
import '@testing-library/jest-dom'; // Lisää jest-dom-matcherit, esim. toBeInTheDocument()

// Mockataan `alert`, jotta voit käyttää sitä testeissä ilman virheilmoituksia
global.alert = vi.fn();
