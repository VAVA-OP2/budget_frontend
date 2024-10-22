import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '/supabaseClient';
import LineChart from './LineChart'; // Tuo LineChart komponentti

export default function SavingsPage() {
    const location = useLocation();
    const { userInfo } = location.state || {};

    const [savings, setSavings] = useState(''); // Syötetty uusi säästötavoite
    const [savedGoal, setSavedGoal] = useState(null); // Tallennettu säästötavoite
    const [addToSavings, setAddToSavings] = useState(''); // Syötettävä summa säästöihin
    const [savingsData, setSavingsData] = useState([]); // Säästötapahtumat kaaviota varten

    // Hakee tallennetun säästötavoitteen ja säästötapahtumat tietokannasta
    const fetchSavingsData = async () => {
        // Hae säästötavoite
        const { data: goalData, error: goalError } = await supabase
            .from('savings')
            .select('goal_amount')
            .eq('user_id', userInfo.id)
            .single();

        if (goalError && goalError.code !== 'PGRST116') {
            console.error('Error fetching savings goal:', goalError);
        } else if (goalData) {
            setSavedGoal(goalData.goal_amount);
        }

        // Hae säästötapahtumat savings_log -taulusta
        const { data: logData, error: logError } = await supabase
            .from('savings_log')
            .select('amount, timestamp')
            .eq('user_id', userInfo.id);

        if (logError) {
            console.error('Error fetching savings log:', logError);
        } else {
            const formattedData = logData.map((entry) => ({
                amount: entry.amount,
                date: new Date(entry.timestamp),
            }));
            setSavingsData(formattedData); // Käytetään kaaviossa
        }
    };

    useEffect(() => {
        if (userInfo.id) {
            fetchSavingsData();
        }
    }, [userInfo]);

    // Lisää rahaa säästöihin ja talleta uusi tapahtuma savings_log -tauluun
    const handleAddToSavings = async () => {
        if (isNaN(addToSavings) || addToSavings.trim() === '') {
            alert('Please enter a valid number for adding to savings.');
            return;
        }

        const newAmount = parseFloat(addToSavings);

        // Lisää uusi säästötapahtuma savings_log -tauluun
        const { error } = await supabase
            .from('savings_log')
            .insert({
                user_id: userInfo.id,
                amount: newAmount,
            });

        if (error) {
            console.error('Error adding to savings log:', error);
            alert('Error adding to savings. Please try again.');
        } else {
            alert('Savings added successfully!');
            setAddToSavings(''); // Tyhjennä syöttökenttä
            fetchSavingsData(); // Päivitä säästötiedot kaaviota varten
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

    // Resetoidaan säästötavoite ja poistetaan säästötapahtumat
    const resetSavings = async () => {
        const { error: goalError } = await supabase
            .from('savings')
            .update({ goal_amount: 0 }) 
            .eq('user_id', userInfo.id);

        if (goalError) {
            console.error('Error resetting savings goal:', goalError);
            alert('Error resetting savings goal.');
            return;
        }

        const { error: logError } = await supabase
            .from('savings_log')
            .delete() // Poistetaan kaikki säästötapahtumat
            .eq('user_id', userInfo.id);

        if (logError) {
            console.error('Error resetting savings log:', logError);
            alert('Error resetting savings log.');
        } else {
            alert('Savings and goal reset successfully!');
            fetchSavingsData(); // Päivitä säästötiedot kaaviota varten
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
                </div>

                <div>
                    <h2>Reset Savings and Goal</h2>
                    <button onClick={resetSavings}>Reset</button>
                </div>
            </div>

            {/* LineChart: Näytetään säästöjen kehitys */}
            <div style={{ flex: 1 }}>
                {savedGoal && savingsData.length > 0 && (
                    <div style={{ height: '100%' }}> 
                        <h2>Savings Progress</h2>
                        <LineChart
                            savingsData={savingsData}
                            goalAmount={savedGoal}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
