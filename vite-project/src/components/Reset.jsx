import { supabase } from '/supabaseClient';

export const resetDataByDates = async (userInfo, startDate, endDate) => {


    const isConfirmed = confirm("Are you sure you want to delete data within the chosen dates? This action cannot be reversed.");

    if (isConfirmed) {
        // poista income
        const { incomeerror } = await supabase
            .from('income')
            .delete()
            .eq('user_id', userInfo.id)
            .gte('date_added', startDate)
            .lte('date_added', endDate)

        // poista expense
        const { expenseerror } = await supabase
            .from('expense')
            .delete()
            .eq('user_id', userInfo.id)
            .gte('date_added', startDate)
            .lte('date_added', endDate)

        if (incomeerror || expenseerror) {
            console.error("Error deleting data");
        } else {
            alert("All data successfully deleted!");
        }


    }
};


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

//SavingsPage.jsx reset buttonin 
export const resetSavings = async (userInfo) => {
    const isConfirmed = confirm("Are you sure you want to delete all savings data? This action cannot be reversed.");

    if (isConfirmed) {
        const { error } = await supabase
            .from('savings')
            .delete()
            .eq('user_id', userInfo.id);

        if (error) {
            console.error('Error resetting savings goal:', error.message);
            alert('Error resetting savings goal.');
            return;
        }

        const { error: logError } = await supabase
            .from('savings_log')
            .delete()
            .eq('user_id', userInfo.id);

        if (logError) {
            console.error('Error resetting savings log:', logError);
            alert('Error resetting savings log.');
        } else {
            alert('All savings data has been successfully deleted!');
        }
    }
};
