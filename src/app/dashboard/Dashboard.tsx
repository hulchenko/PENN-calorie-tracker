"use client";

import { generateGreeting, generateWeek, getProgressPercent, goalReduce } from "@/lib/weekUtils";
import { CircularProgress, CircularProgressLabel, Divider, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useWeek } from "../context/WeekContext";
import DayCard from "./DayCard";
import moment from "moment";

const Dashboard = () => {
  const { memoWeek: week, memoPrevWeeks: prevWeeks } = useWeek();
  const { user } = useUser();

  const [weeklyGoal, setWeeklyGoal] = useState(0);
  const [progress, setProgress] = useState(0);
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState({
    user: true,
    week: true,
  });

  useEffect(() => {
    const name = user?.name;
    if (name) {
      const greeting = generateGreeting(name);
      setGreeting(greeting);
    }
    setLoading((prev) => ({
      ...prev,
      user: false,
    }));
  }, [user]);

  useEffect(() => {
    const dailyGoals = week?.daily_goals_met;
    if (dailyGoals) {
      const goals = goalReduce(dailyGoals);
      const percent = getProgressPercent(goals);
      setWeeklyGoal(goals);
      setProgress(percent);
      setLoading((prev) => ({
        ...prev,
        week: false,
      }));
    }
  }, [week]);

  if (loading.user || loading.week) {
    return (
      <div className="flex justify-center mt-96">
        <Spinner thickness="4px" speed="1s" color="teal.600" size="xl" />
      </div>
    );
  }

  return (
    <div className="w-full flex items-center flex-col h-full">
      <div className="w-full flex text-2xl font-bold my-6 sm:pl-24 sm:text-4xl sm:mt-14 justify-center sm:justify-start">{greeting}</div>
      <div className="flex flex-row w-full border rounded justify-evenly items-center sm:p-2 lg:w-1/2 2xl:w-1/4">
        <Text className="text-xl font-bold lg:text-3xl">Weekly Goals</Text>
        <CircularProgress value={progress} color="teal.600" size={window.innerWidth <= 1024 ? 100 : 150} thickness="16px" className="ml-10 sm:ml-0">
          <CircularProgressLabel>{weeklyGoal}/7 </CircularProgressLabel>
        </CircularProgress>
      </div>
      <div className="w-full flex items-start sm:items-center flex-col rounded sm:border lg:w-3/4 lg:shadow-md lg:mt-16">
        <Text className="text-xl font-bold p-4 lg:text-3xl">Current Week</Text>
        <Divider />
        <DayList curr={week} prev={null} readOnly={false} />
      </div>

      <div className="w-full flex items-start sm:items-center flex-col rounded mt-4 sm:border lg:w-3/4 lg:shadow-md lg:mt-16">
        <Text className="text-xl font-bold p-4 lg:text-3xl">Previous Weeks</Text>
        {prevWeeks.length > 0 &&
          prevWeeks.map((prev) => (
            <div className="w-full" key={prev.week_id}>
              <Divider />
              <p className="flex items-start justify-start w-full pl-4 pt-4 text-gray-400">Week of {moment.utc(prev.start_date).format("ll")}</p>
              <DayList curr={null} prev={prev} readOnly={true} />
            </div>
          ))}
        {prevWeeks.length === 0 && <p className="text-base py-4 flex justify-center w-full">Past weeks will be displayed here.</p>}
      </div>
    </div>
  );
};

const DayList = ({ curr, prev, readOnly }) => {
  const targetWeek = prev ? prev : curr;
  return (
    <ul className="flex flex-col justify-center flex-wrap sm:py-6 md:flex-row w-full h-full">
      {generateWeek(targetWeek).map((day, index) => (
        <DayCard key={day.date} data={{ day, targetWeek, index, readOnly }} />
      ))}
    </ul>
  );
};
export default Dashboard;
