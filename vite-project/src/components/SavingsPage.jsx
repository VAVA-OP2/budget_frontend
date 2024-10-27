import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '/supabaseClient';
import LineChart from './LineChart';
import { resetSavings } from './Reset';

export default function SavingsPage() {
    const location = useLocation();
    const { userInfo } = location.state || {};

    const [savings, setSavings] = useState('');
    const [savedGoal, setSavedGoal] = useState(null);
    const [addToSavings, setAddToSavings] = useState('');
    const [savingsData, setSavingsData] = useState([]);
    const [isEditingGoal, setIsEditingGoal] = useState(false);

    const fetchSavingsData = async () => {
        // Hae säästötavoite
        const { data: goalData, error: goalError } = await supabase
            .from('savings')
            .select('goal_amount')
            .eq('user_id', userInfo.id)
            .single();
        if (!goalError && goalData) setSavedGoal(goalData.goal_amount);

        // Hae säästötapahtumat
        const { data: logData, error: logError } = await supabase
            .from('savings_log')
            .select('amount, timestamp')
            .eq('user_id', userInfo.id);
        if (!logError && logData) {
            setSavingsData(logData.map(entry => ({
                amount: entry.amount,
                date: new Date(entry.timestamp),
            })));
        }
    };

    useEffect(() => {
        if (userInfo.id) fetchSavingsData();
    }, [userInfo]);

    const handleAddToSavings = async () => {
        if (isNaN(addToSavings) || addToSavings.trim() === '') {
            alert('Please enter a valid number for adding to savings.');
            return;
        }

        const newAmount = parseFloat(addToSavings);
        const { error } = await supabase
            .from('savings_log')
            .insert({ user_id: userInfo.id, amount: newAmount });

        if (!error) {
            alert('Savings added successfully!');
            setSavingsData(prev => [...prev, { amount: newAmount, date: new Date() }]);
            setAddToSavings('');
        } else {
            console.error('Error adding to savings log:', error);
            alert('Error adding to savings. Please try again.');
        }
    };

    const createOrUpdateSavingsGoal = async () => {
        if (isNaN(savings) || savings.trim() === '') {
            alert('Please enter a valid number for savings goal.');
            return;
        }

        const goalAmount = parseFloat(savings);

        // Tarkista, onko säästötavoite jo olemassa
        const { data: existingGoal, error: fetchError } = await supabase
            .from('savings')
            .select('goal_amount')
            .eq('user_id', userInfo.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching existing savings goal:', fetchError);
            alert('Error fetching existing savings goal.');
            return;
        }

        // Päivitä tai lisää säästötavoite
        if (existingGoal) {
            const { error: updateError } = await supabase
                .from('savings')
                .update({ goal_amount: goalAmount })
                .eq('user_id', userInfo.id);

            if (updateError) {
                console.error('Error updating savings goal:', updateError);
                alert('Error updating savings goal. Please try again.');
            } else {
                alert('Savings goal updated successfully!');
                setSavedGoal(goalAmount);
                setSavings('');
                setIsEditingGoal(false);
            }
        } else {
            const { error: insertError } = await supabase
                .from('savings')
                .insert({
                    goal_amount: goalAmount,
                    user_id: userInfo.id,
                });

            if (insertError) {
                console.error('Error adding savings goal:', insertError);
                alert('Error adding savings goal. Please try again.');
            } else {
                alert('Savings goal added successfully!');
                setSavedGoal(goalAmount);
                setSavings('');
                setIsEditingGoal(false);
            }
        }
    };

    const handleResetSavings = async () => {
        await resetSavings(userInfo);
        fetchSavingsData(); // Päivitä tiedot resetoinnin jälkeen
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, marginRight: '20px' }}>
                <h2>Add or Update your Savings Goal</h2>
                {savedGoal === null || isEditingGoal ? (
                    <>
                        <input
                            type="text"
                            placeholder="Enter your savings goal"
                            value={savings}
                            onChange={(e) => setSavings(e.target.value)}
                        />
                        <button onClick={createOrUpdateSavingsGoal}>
                            {savedGoal ? "Update Savings Goal" : "Save Savings Goal"}
                        </button>
                    </>
                ) : (
                    <div>
                        <p>Your current savings goal is: {savedGoal} €</p>
                        <button onClick={() => setIsEditingGoal(true)}>Edit</button>
                    </div>
                )}

                <h2>Add to your Savings</h2>
                <input
                    type="text"
                    placeholder="Enter amount to add to savings"
                    value={addToSavings}
                    onChange={(e) => setAddToSavings(e.target.value)}
                />
                <button onClick={handleAddToSavings}>Add to Savings</button>

                {savingsData.length > 0 && (
                    <div>
                        <h3>All Added Amounts:</h3>
                        <ul>
                            {savingsData.map((entry, index) => (
                                <li key={index}>{entry.amount} €</li>
                            ))}
                        </ul>
                    </div>
                )}

                <h2>Reset Savings</h2>
                <button onClick={handleResetSavings}>Reset</button>
            </div>

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
