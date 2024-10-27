import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '/supabaseClient';
import LineChart from './LineChart';
import { resetIncome, resetExpense, resetSavings } from './Reset';

export default function SavingsPage() {
    const location = useLocation();
    const { userInfo } = location.state || {};

    const [savings, setSavings] = useState('');
    const [savedGoal, setSavedGoal] = useState(null);
    const [addToSavings, setAddToSavings] = useState('');
    const [savingsData, setSavingsData] = useState([]);
    const [allSavingsEntries, setAllSavingsEntries] = useState([]); // New: stores all savings entries
    const [lastAddedAmount, setLastAddedAmount] = useState(null); // New: stores the last added amount

    const fetchSavingsData = async () => {
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
            setSavingsData(formattedData);
            setAllSavingsEntries(formattedData.map(entry => entry.amount)); // New: stores all amounts
        }
    };

    useEffect(() => {
        if (userInfo.id) {
            fetchSavingsData();
        }
    }, [userInfo]);

    const handleAddToSavings = async () => {
        if (isNaN(addToSavings) || addToSavings.trim() === '') {
            alert('Please enter a valid number for adding to savings.');
            return;
        }

        const newAmount = parseFloat(addToSavings);

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
            setLastAddedAmount(newAmount); // New: update last added amount
            setAllSavingsEntries(prevEntries => [...prevEntries, newAmount]); // New: add to entries list
            setAddToSavings('');
            fetchSavingsData();
        }
    };

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

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, marginRight: '20px' }}>
                <h2>Add or Update your Savings Goal</h2>
                <input
                    type="text"
                    placeholder="Enter your savings goal"
                    value={savings}
                    onChange={(e) => setSavings(e.target.value)}
                />
                <button onClick={addOrUpdateSavingsGoal}>Save Savings Goal</button>
                {savedGoal && <p>Your current savings goal is: {savedGoal}</p>}

                <h2>Add to your Savings</h2>
                <input
                    type="text"
                    placeholder="Enter amount to add to savings"
                    value={addToSavings}
                    onChange={(e) => setAddToSavings(e.target.value)}
                />
                <button onClick={handleAddToSavings}>Add to Savings</button>
                {lastAddedAmount !== null && (
                    <p>Last added amount: {lastAddedAmount} €</p>
                )}
                {allSavingsEntries.length > 0 && (
                    <div>
                        <h3>All Added Amounts:</h3>
                        <ul>
                            {allSavingsEntries.map((amount, index) => (
                                <li key={index}>{amount} €</li>
                            ))}
                        </ul>
                    </div>
                )}

                <h2>Reset Savings and Goal</h2>
                <button onClick={() => resetSavings(userInfo)}>Reset</button>
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
