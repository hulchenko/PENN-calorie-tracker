import { getDay, updateDay } from '@/db/dayActions';
import { removeMeal } from '@/db/mealActions';
import { updateWeek } from '@/db/weekActions';
import { Day } from '@/types/Day';
import { Meal } from '@/types/Meal';
import { Week } from '@/types/Week';

export const removeMealRecord = async (meal: Meal, day: Day, week: Week) => {
    const { user_id, date } = day;
    try {
        // delete meal
        await removeMeal(meal);

        // update day, reduce calories and update goal
        const updatedDay = updateDayStats(day, meal);
        await updateDay(updatedDay);

        // update week based on updated day goal
        const fetchedDay = getDay(user_id, date);
        const updatedWeek = updateWeekStats(week, updatedDay, fetchedDay);
        await updateWeek(updatedWeek);
        
        return { success: true, message: 'Successfully updated records'}
    } catch (error) {
        throw Error('Error handling meal removal', error);
    }
}

const updateDayStats = (day: Day, meal: Meal) => {
    const updatedDay = {...day};
    updatedDay.calories_consumed -= meal.calories;
    updatedDay.goal_met = updatedDay.calories_consumed >= updatedDay.calorie_target;
    return updatedDay;
}

const updateWeekStats = (week: Week, updatedDay: Day, fetchedDay) => {
    const updatedWeek = {...week};
    const prevGoalMet = fetchedDay.goal_met;
    const currGoalMet = updatedDay.goal_met;
    if(prevGoalMet && !currGoalMet){
        updatedWeek.daily_goals_met--;
    }
    return updatedWeek;
}