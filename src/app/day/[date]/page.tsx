import { getDay } from '@/db/dayActions';
import { defaultDay } from '@/lib/dayUtils';
import { Day } from '@/types/Day';
import DayForm from './DayForm';

const DayPage = async (context) => {
    const date = decodeURIComponent(context.params.date);
    const userId = context.searchParams.user_id;
    const week = context.searchParams.week;
    
    const day: Day = await getDay(userId, date) || defaultDay(userId, date);

    return (
        <DayForm data={{day, week}}/>
     );
}
 
export default DayPage;

