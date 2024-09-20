import { supabase } from '/supabaseClient';


//Kysytään käyttäjältä varmistus ja poistetaan tiedot tulo taulusta
export const resetIncome = async (userInfo) => {
    const isConfirmed = confirm("Are you sure you want to delete all income? This action cannot be reversed.");

    if (isConfirmed) {
        const { error } = await supabase
            .from('income')
            .delete()
            .eq('user_id', userInfo.id);

        if (error) {
            console.error("Error resetting income", error.message);
        } else {
            alert("All income has been successfully deleted!");
        }
    } 
};

//Kysytään käyttäjältä varmistus ja poistetaan tiedot menot taulusta
export const resetExpense = async (userInfo) => {
    const isConfirmed = confirm("Are you sure you want to delete all expenses? This action cannot be reversed.");

    if (isConfirmed) {
        const { error } = await supabase
            .from('expense')
            .delete()
            .eq('user_id', userInfo.id);

        if (error) {
            console.error("Error resetting expense", error.message);
        } else {
            alert("All expenses have been successfully deleted!");
        }
    } 
};