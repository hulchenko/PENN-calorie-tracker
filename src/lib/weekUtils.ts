import { v4 as uuidv4 } from "uuid";
import { Week } from "@/types/Week";
import moment from "moment";
import { User } from "@/types/User";
import { getWeekDays } from "@/db/dayActions";
import { getDayIdx } from "./dayUtils";
import { updateWeek } from "@/db/weekActions";

const weekStart = moment.utc().startOf("isoWeek"); // '2024-09-09'
const weekEnd = moment.utc().endOf("isoWeek"); // '2024-09-15'

export const firstWeekDay = weekStart.clone().seconds(0).milliseconds(0).toISOString();
export const lastWeekDay = weekEnd.clone().seconds(0).milliseconds(0).toISOString();

export const defaultWeek = (userId: string): Week => {
  const start = weekStart.clone().seconds(0).milliseconds(0).toISOString();
  const end = weekEnd.clone().seconds(0).milliseconds(0).toISOString();
  return {
    week_id: uuidv4(),
    user_id: userId,
    start_date: start,
    end_date: end,
    daily_goals_met: generateWeeklyTargets(),
  };
};

export const generateWeek = (week: Week | null = null) => {
  const generatedWeek: Array<any> = [];
  const start = week ? moment.utc(week.start_date).startOf("isoWeek") : weekStart;
  const end = week ? moment.utc(week.start_date).endOf("isoWeek") : weekEnd;

  let dayOfWeek = start.clone(); // initialize first week day from the given week

  while (dayOfWeek.isSameOrBefore(end)) {
    const date = dayOfWeek.seconds(0).milliseconds(0).toISOString();
    const weekDay = dayOfWeek.format("dddd");
    generatedWeek.push({ weekDay, date });
    dayOfWeek.add(1, "day");
  }

  return generatedWeek;
};

export const updateWeekTargets = async (user: User, week: Week) => {
  try {
    const { user_id = "", target = 0 } = user; // set default values if undefined
    const weekDays = await getWeekDays(user_id, firstWeekDay, lastWeekDay);

    const targetMap = generateWeeklyTargets();
    for (const day of weekDays) {
      const dayIdx = getDayIdx(day.date);
      const isTargetMet = day.calories_consumed >= target;
      targetMap[dayIdx] = isTargetMet;
    }
    week.daily_goals_met = targetMap;
    const response = await updateWeek(week);
    return response;
  } catch (error) {
    console.error(error);
    throw Error("Failed to update weekly targets.");
  }
};

const generateWeeklyTargets = () => {
  const targetMap = {};
  for (let i = 0; i < 7; i++) {
    targetMap[i] = false;
  }
  return targetMap;
};

export const goalReduce = (weeklyGoal: object): number => {
  if (weeklyGoal) {
    const result = Object.values(weeklyGoal).reduce((goals: any, goalMet: boolean) => {
      if (goalMet) {
        goals++;
      }
      return goals;
    }, 0);
    return result as number;
  }
  return 0;
};

export const getProgressPercent = (currGoal: number) => {
  const max = 7;
  return Math.floor((currGoal * 100) / max);
};

export const generateGreeting = (name = "User") => {
  const currentHour = new Date(Date.now()).getHours();
  const morning = currentHour >= 3 && currentHour < 12;
  const afternoon = currentHour >= 12 && currentHour < 17;
  const evening = (currentHour >= 17 && currentHour <= 23) || (currentHour >= 0 && currentHour < 3);
  if (morning && name) {
    return `Good Morning, ${name} 🌅`;
  }
  if (afternoon && name) {
    return `Good Afternoon, ${name} 🌞`;
  }
  if (evening && name) {
    return `Good Evening, ${name} 🌚`;
  }
  return "Hello";
};

export const isCurrentWeek = (date: string) => {
  const targetDate = moment.utc(date);
  return targetDate >= weekStart && targetDate <= weekEnd;
};

export const processWeekData = (data: Week[], userId: string) => {
  if (data.length > 0) {
    const curr =
      data.find((week) => {
        const incWeekStart = moment.utc(week.start_date).format("L");
        const currWeekStart = moment.utc(firstWeekDay).format("L");
        return incWeekStart === currWeekStart;
      }) || defaultWeek(userId);
    const prev = data.filter((week) => {
      const incWeekStart = moment.utc(week.start_date).format("L");
      const currWeekStart = moment.utc(firstWeekDay).format("L");
      return incWeekStart !== currWeekStart;
    });
    return { curr, prev };
  } else {
    return { curr: defaultWeek(userId), prev: [] };
  }
};
