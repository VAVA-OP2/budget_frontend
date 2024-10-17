import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';  // Tuodaan useLocation
import { supabase } from '/supabaseClient';      // Muista tuoda Supabase-kirjasto

export default function SavingsPage() {
    const location = useLocation();
    const { userInfo } = location.state || {}; // Haetaan siirretty userInfo state
    
    const [savings, setSavings] = useState('');          // Syötetty uusi säästötavoite
    const [savedGoal, setSavedGoal] = useState(null);    // Tallennettu säästötavoite
    const [currentSavings, setCurrentSavings] = useState(0); // Nykyiset säästöt
    const [addToSavings, setAddToSavings] = useState('');  // Syötettävä summa, jolla lisätään säästöjä

    // Hakee tallennetun säästötavoitteen ja nykyiset säästöt tietokannasta, kun sivu latautuu
    useEffect(() => {
        const fetchSavingsData = async () => {
            const { data, error } = await supabase
                .from('savings')
                .select('goal_amount, current_savings')
                .eq('user_id', userInfo.id)
                .single();  // Haetaan vain yksi rivi käyttäjän ID:llä

            if (error && error.code !== 'PGRST116') { // 'PGRST116' tarkoittaa, ettei riviä löytynyt
                console.error('Error fetching savings data:', error);
            } else if (data) {
                setSavedGoal(data.goal_amount); // Tallennettu tavoite asetetaan tilaan
                setCurrentSavings(data.current_savings); // Asetetaan nykyiset säästöt tilaan
            }
        };

        if (userInfo.id) {
            fetchSavingsData();
        }
    }, [userInfo]);

    // Lisää rahaa nykyisiin säästöihin
    const handleAddToSavings = async () => {
        if (isNaN(addToSavings) || addToSavings.trim() === '') {
            alert('Please enter a valid number for adding to savings.');
            return;
        }

        const newSavings = currentSavings + parseFloat(addToSavings);

        const { error } = await supabase
            .from('savings')
            .update({ current_savings: newSavings })
            .eq('user_id', userInfo.id);

        if (error) {
            console.error('Error updating current savings:', error);
            alert('Error adding to savings. Please try again.');
        } else {
            alert('Savings updated successfully!');
            setCurrentSavings(newSavings);  // Päivitetään näyttö
            setAddToSavings('');  // Tyhjennetään syöttökenttä
        }
    };

    // Lisää tai päivittää säästötavoitteen
    const addOrUpdateSavingsGoal = async () => {
        if (isNaN(savings) || savings.trim() === '') {
            alert('Please enter a valid number for savings goal.');
            return;
        }

        const { data: existingGoal, error: fetchError } = await supabase
            .from('savings')
            .select('goal_amount')
            .eq('user_id', userInfo.id)
            .single(); // Haetaan yksi rivi käyttäjän ID:llä

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error(fetchError);
            alert('Error fetching existing savings goal.');
            return;
        }

        if (existingGoal) {
            // Jos käyttäjällä on jo tavoite, päivitetään se
            const { error: updateError } = await supabase
                .from('savings')
                .update({ goal_amount: parseFloat(savings) })
                .eq('user_id', userInfo.id);

            if (updateError) {
                console.error(updateError);
                alert('Error updating savings goal. Please try again.');
            } else {
                alert('Savings goal updated successfully!');
                setSavedGoal(savings);  // Päivitetään näyttö
                setSavings('');  // Tyhjennetään syöttökenttä
            }
        } else {
            // Jos käyttäjällä ei ole tavoitetta, lisätään uusi tietue
            const { error: insertError } = await supabase
                .from('savings')
                .insert({
                    goal_amount: parseFloat(savings),
                    user_id: userInfo.id,
                    current_savings: currentSavings // Alussa 0 tai aiemmat säästöt
                });

            if (insertError) {
                console.error(insertError);
                alert('Error adding savings goal. Please try again.');
            } else {
                alert('Savings goal added successfully!');
                setSavedGoal(savings);  // Päivitetään näyttö
                setSavings('');  // Tyhjennetään syöttökenttä
            }
        }
    };

    return (
        <div>
            <h1>Savings Page</h1>

            {/* Säästötavoitteen asettaminen */}
            <div>
                <h2>Add or Update your Savings Goal</h2>
                <input
                    type="text"
                    placeholder="Enter your savings goal"
                    value={savings}
                    onChange={(e) => setSavings(e.target.value)}
                />
                <button onClick={addOrUpdateSavingsGoal}>Save Savings Goal</button> {/* Painike tallennukseen */}

                {/* Näytetään tallennettu säästötavoite pysyvästi */}
                {savedGoal && (
                    <p>Your current savings goal is: {savedGoal}</p>
                )}
            </div>

            {/* Säästöjen lisääminen */}
            <div>
                <h2>Add to your Savings</h2>
                <input
                    type="text"
                    placeholder="Enter amount to add to savings"
                    value={addToSavings}
                    onChange={(e) => setAddToSavings(e.target.value)}
                />
                <button onClick={handleAddToSavings}>Add to Savings</button> {/* Painike säästöjen lisäämiseen */}

                {/* Näytetään nykyiset säästöt */}
                <p>Your current savings are: {currentSavings}</p>

                {/* Näytetään vertailu tavoitteen ja säästöjen välillä */}
                {savedGoal && (
                    <p>You have saved {((currentSavings / savedGoal) * 100).toFixed(2)}% of your goal.</p>
                )}
            </div>
        </div>
    );
}
