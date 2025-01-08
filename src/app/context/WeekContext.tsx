"use client";

import { processWeekData } from "@/lib/weekUtils";
import { Week } from "@/types/Week";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import useSWR from "swr";
import { useSession } from "./SessionProvider";

export const WeekProvider = ({ children }) => {
  const [week, setWeek] = useState<Week | null>(null);
  const [prevWeeks, setPrevWeeks] = useState<Week[]>([]);

  const { session } = useSession();
  const userId = session?.user?.user_id || "";

  const fetcher = useCallback(async () => {
    const res = await fetch(`/api/db/week?userId=${userId}`);
    const data = await res.json();
    return data;
  }, [userId]);

  useSWR("/api/db/week", fetcher, {
    onSuccess: (data: any) => {
      const { curr, prev } = processWeekData(data, userId);
      setWeek(curr);
      setPrevWeeks(prev);
    },
  });

  const memoWeek = useMemo(() => week, [week]);
  const memoPrevWeeks = useMemo(() => prevWeeks, [prevWeeks]);

  return <WeekContext.Provider value={{ memoWeek, memoPrevWeeks, setWeek, setPrevWeeks }}>{children}</WeekContext.Provider>;
};

const WeekContext = createContext<{
  memoWeek: Week | null;
  memoPrevWeeks: Week[];
  setWeek: (week: Week | null) => void;
  setPrevWeeks: (prevWeeks: Week[]) => void;
}>({
  memoWeek: null,
  memoPrevWeeks: [],
  setWeek: () => {},
  setPrevWeeks: () => {},
}); // define passing value

export const useWeek = () => useContext(WeekContext);
