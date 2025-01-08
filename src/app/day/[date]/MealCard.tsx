import { useMeal } from "@/app/context/MealContext";
import { useUser } from "@/app/context/UserContext";
import { useWeek } from "@/app/context/WeekContext";
import { getDayIdx } from "@/lib/dayUtils";
import { removeMeal } from "@/lib/mealUtils";
import { Meal } from "@/types/Meal";
import { Week } from "@/types/Week";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

const MealCard = ({ data }) => {
  const { meal, day, setDay, readOnly } = data;

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { mealList, setMealList } = useMeal();
  const { memoWeek: week, setWeek } = useWeek();
  const { user } = useUser();

  const dayIdx = getDayIdx(day.date);
  const dailyTarget = parseInt(user?.target as string);

  const mealRemoveHandler = async (event) => {
    event?.preventDefault();

    const filteredMealList = mealList.filter((m: Meal) => m.meal_id !== meal.meal_id);
    const dailyCalories = filteredMealList.reduce((total: number, meal: Meal) => total + meal.calories, 0);
    const updatedDay = {
      ...day,
      calories_consumed: day.calories_consumed - meal.calories,
    };

    const updatedWeek = {
      ...week,
      daily_goals_met: {
        ...week?.daily_goals_met,
        [dayIdx]: dailyCalories >= dailyTarget,
      },
    } as Week;

    const isLocalUpdate = await removeMeal(meal, updatedDay, updatedWeek, toast);

    if (!isLocalUpdate) {
      // ensure DOM is updated only if written to DB
      setDay(updatedDay);
      setWeek(updatedWeek);
    }
    setMealList(filteredMealList);
  };

  return (
    <>
      <Card key={meal.meal_id} variant="elevated" className="cursor-default hover:shadow-teal-700 hover:shadow-md w-auto sm:w-96 mx-4 mt-3 sm:m-4">
        <CardHeader py={window.innerWidth <= 640 ? 1 : 4}>
          <Text className="text-teal-600 text-2xl lg:text-3xl font-bold">{meal.meal_type}</Text>
        </CardHeader>
        <CardBody py={window.innerWidth <= 640 ? 0 : 4} className="text-gray-600">
          <Text className="truncate lg:text-balance">
            <b>Description:</b> {meal.meal_description}
          </Text>
          <Text>
            <b>Total Calories:</b> <b className="text-teal-600">{meal.calories}</b>
          </Text>
        </CardBody>
        <Button onClick={onOpen}>Click for details</Button>
      </Card>

      {/* Modal for Meal Card */}

      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="outside" isCentered>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={mealRemoveHandler}>
            <ModalCloseButton size="lg" />
            <ModalBody className="mt-10">
              <Card key={meal.meal_id} variant="elevated">
                <CardHeader>
                  <Text className="text-teal-600 text-3xl font-bold">{meal.meal_type}</Text>
                </CardHeader>
                <CardBody>
                  <Text>
                    <b>Description:</b> {meal.meal_description}
                  </Text>
                  <Text className="font-bold">Nutritions:</Text>
                  {meal?.items.map((ingredient, index) => (
                    <div className="ml-2 border border-teal-600 rounded p-4 m-2" key={index}>
                      <Text>Ingridient: {ingredient?.name}</Text>
                      <Text>Calories: {ingredient?.calories}</Text>
                      <Text>Carbohydrates: {ingredient?.carbohydrates_total_g} g</Text>
                      <Text>Cholesterol: {ingredient?.cholesterol_mg} mg</Text>
                      <Text>Saturated Fat: {ingredient?.fat_saturated_g} g</Text>
                      <Text>Total Fat: {ingredient?.fat_total_g} g</Text>
                      <Text>Fiber: {ingredient?.fiber_g} g</Text>
                      <Text>Potassium: {ingredient?.potassium_mg} mg</Text>
                      <Text>Protein: {ingredient?.protein_g} g</Text>
                      <Text>Serving Size: {ingredient?.serving_size_g} g</Text>
                      <Text>Sodium: {ingredient?.sodium_mg} mg</Text>
                      <Text>Sugar: {ingredient?.sugar_g} g</Text>
                    </div>
                  ))}
                  <Text>
                    <b>Total Calories:</b> <b className="text-teal-600">{meal.calories}</b>
                  </Text>
                </CardBody>
              </Card>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="red" size="md" type="submit" m={3} onClick={onClose} hidden={readOnly}>
                Remove
              </Button>
              <Button colorScheme="teal" size="md" onClick={onClose} hidden={readOnly}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MealCard;
