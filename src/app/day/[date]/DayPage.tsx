"use client";

import { useMeal } from "@/app/context/MealContext";
import { useUser } from "@/app/context/UserContext";
import { useWeek } from "@/app/context/WeekContext";
import { getDay } from "@/db/dayActions";
import { batchWriteMeals, getDayIdx, getDefaultDay, getMeals, sortMeals } from "@/lib/dayUtils";
import { isCurrentWeek } from "@/lib/weekUtils";
import { Day } from "@/types/Day";
import { Week } from "@/types/Week";
import { Spinner, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import DayHeader from "./DayHeader";
import MealCard from "./MealCard";
import MealInputForm from "./MealInputForm";
import { Meal } from "@/types/Meal";

const DayPage = ({ date }) => {
  const toast = useToast();
  const { memoWeek: week, setWeek } = useWeek();
  const { user } = useUser();
  const { mealList, setMealList } = useMeal();

  const [day, setDay] = useState<Day | null>(null);
  const [loading, setLoading] = useState({ mealList: true, day: true });
  const [saveReady, setSaveReady] = useState(false);

  const dayIdx = getDayIdx(date);
  const readOnly = !isCurrentWeek(date);
  const dailyTarget = parseInt(user?.target as string);

  useEffect(() => {
    const userId = user?.user_id as string;
    const fetchDay = async () => {
      const dayDB: Day | null = await getDay(userId, date);
      if (dayDB) {
        setDay(dayDB);
      } else {
        const defaultDay: Day = getDefaultDay(userId, date);
        setDay(defaultDay);
      }
      setLoading((prev) => ({
        ...prev,
        day: false,
      }));
    };
    if (userId) {
      fetchDay();
    }
  }, [user]);

  useEffect(() => {
    if (day) {
      getMeals(day, setMealList, setLoading, toast);
    }
  }, [day]);

  const submitHandler = async () => {
    const dailyCalories = mealList?.reduce((total: number, meal: Meal) => total + meal.calories, 0) || 0;
    const isDayChanged = dailyCalories !== day?.calories_consumed;
    const isMealListChanged = mealList?.length;

    if (isMealListChanged) {
      // writes to meals table

      const updatedDay = {
        ...day,
        calories_consumed: dailyCalories,
      } as Day;

      const updatedWeek = {
        ...week,
        daily_goals_met: {
          ...week?.daily_goals_met,
          [dayIdx]: dailyCalories >= dailyTarget,
        },
      } as Week;

      await batchWriteMeals(updatedDay, mealList, updatedWeek, toast);
      setSaveReady(false);
      setDay(updatedDay);
      setWeek(updatedWeek);
    }

    if (!isDayChanged && !isMealListChanged) {
      toast({ title: "Nothing to update", status: "info" });
    }
  };

  if (loading.mealList || loading.day) {
    return (
      <div className="flex justify-center mt-96">
        <Spinner thickness="4px" speed="1s" color="teal.600" size="xl" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <DayHeader day={day} dailyTarget={dailyTarget} />
      <div className="mx-auto mt-6 sm:mt-20 items-center flex flex-col text-xl w-full">
        <div className="h-full w-full items-center grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 sm:justify-items-center xl:w-3/4">
          {sortMeals(mealList)?.map((meal) => (
            <MealCard key={meal.meal_id} data={{ meal, day, setDay, readOnly }} />
          ))}
        </div>
        <MealInputForm readOnly={readOnly} setSaveReady={setSaveReady} />
        {saveReady && (
          <button
            className="fixed bottom-1 left-4 bg-teal-700 hover:bg-teal-600  text-white py-4 p-6 mt-2 rounded lg:bottom-40 lg:left-auto lg:right-24 z-10"
            onClick={submitHandler}
            hidden={readOnly}
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default DayPage;
