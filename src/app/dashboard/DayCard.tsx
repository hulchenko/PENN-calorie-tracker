import { Card, CardBody, CardHeader } from "@chakra-ui/react";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";

const DayCard = ({ data }) => {
  const { week, index } = data;
  const { date, weekDay } = data.day;

  const [isGoalMet, setIsGoalMet] = useState(false);

  const displayDate = moment(date).format("MMM Do");
  const isToday = moment(date).format("L") === moment(Date.now()).format("L");

  useEffect(() => {
    const goal = week?.daily_goals_met[index] || false;
    setIsGoalMet(goal);
  }, [week]);

  return (
    <Link href={{ pathname: `/day/${date}` }}>
      <Card
        h={32}
        className="hover:shadow-teal-700 hover:shadow-md w-80 m-4 h-36"
        bg={isGoalMet ? "teal.600" : "white"}
      >
        <CardBody
          className="flex justify-end self-end text-xl"
          textColor={isGoalMet ? "white" : "gray.500"}
        >
          {isToday ? "Today" : ""} {displayDate}
        </CardBody>
        <CardHeader
          className="flex text-4xl font-bold"
          textColor={isGoalMet ? "white" : "teal.600"}
          p={0}
          mb={6}
          ml={4}
        >
          {weekDay}
        </CardHeader>
      </Card>
    </Link>
  );
};

export default DayCard;
