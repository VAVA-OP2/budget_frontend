import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '/supabaseClient';
import LineChart from './LineChart'; // Tuo LineChart komponentti

export default function SavingsPage() {
    const location = useLocation();
    const { userInfo } = location.state || {};

    const [savings, setSavings] = useState(''); // Syötetty uusi säästötavoite
    const [savedGoal, setSavedGoal] = useState(null); // Tallennettu säästötavoite
    const [currentSavings, setCurrentSavings] = useState(0); // Nykyiset säästöt
    const [addToSavings, setAddToSavings] = useState(''); // Syötettävä summa säästöihin

    // Hakee tallennetun säästötavoitteen ja nykyiset säästöt tietokannasta
    useEffect(() => {
        const fetchSavingsData = async () => {
            const { data, error } = await supabase
                .from('savings')
                .select('goal_amount, current_savings')
                .eq('user_id', userInfo.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching savings data:', error);
            } else if (data) {
                setSavedGoal(data.goal_amount);
                setCurrentSavings(data.current_savings);
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
            setCurrentSavings(newSavings);
            setAddToSavings('');
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
            .single();

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
                setSavedGoal(savings);
                setSavings('');
            }
        } else {
            // Jos käyttäjällä ei ole tavoitetta, lisätään uusi tietue
            const { error: insertError } = await supabase
                .from('savings')
                .insert({
                    goal_amount: parseFloat(savings),
                    user_id: userInfo.id,
                    current_savings: currentSavings,
                });

            if (insertError) {
                console.error(insertError);
                alert('Error adding savings goal. Please try again.');
            } else {
                alert('Savings goal added successfully!');
                setSavedGoal(savings);
                setSavings('');
            }
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            {/* Tekstiosio säästöistä */}
            <div style={{ flex: 1, marginRight: '20px' }}>
                <div>
                    <h2>Add or Update your Savings Goal</h2>
                    <input
                        type="text"
                        placeholder="Enter your savings goal"
                        value={savings}
                        onChange={(e) => setSavings(e.target.value)}
                    />
                    <button onClick={addOrUpdateSavingsGoal}>Save Savings Goal</button>
                    {savedGoal && <p>Your current savings goal is: {savedGoal}</p>}
                </div>

                <div>
                    <h2>Add to your Savings</h2>
                    <input
                        type="text"
                        placeholder="Enter amount to add to savings"
                        value={addToSavings}
                        onChange={(e) => setAddToSavings(e.target.value)}
                    />
                    <button onClick={handleAddToSavings}>Add to Savings</button>
                    <p>Your current savings are: {currentSavings}</p>
                    {savedGoal && (
                        <p>You have saved {((currentSavings / savedGoal) * 100).toFixed(2)}% of your goal.</p>
                    )}
                </div>
            </div>

            {/* LineChart: Näytetään säästöjen kehitys */}
            <div style={{ flex: 1 }}>
                {savedGoal && currentSavings > 0 && (
                    <div style={{ height: '100%' }}>  {/* Varmista, että kaavion korkeus täsmää tekstiosion kanssa */}
                        <h2>Savings Progress</h2>
                        <LineChart
                            currentSavings={currentSavings}
                            goalAmount={savedGoal}
                        />
                    </div>
                )}
            </div>
        </div>

    );
}
