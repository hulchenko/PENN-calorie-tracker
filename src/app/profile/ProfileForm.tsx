"use client";

import { User } from "@/types/User";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  NumberInput,
  NumberInputField,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useUser } from "../context/UserContext";
import { useWeek } from "../context/WeekContext";
import { Week } from "@/types/Week";

interface UserForm {
  name: string;
  email: string;
  target: string | number;
}

const ProfileForm = () => {
  const toast = useToast();
  const { user, setUser } = useUser();
  const { week, setWeek } = useWeek();

  const initUser = useRef<User | null>(null);
  const [userForm, setUserForm] = useState<UserForm>({
    name: "",
    email: "",
    target: 0,
  });
  const [loading, setLoading] = useState(true);
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    const target = user?.target;
    if (target) {
      const { name, email } = user;

      initUser.current = user;
      setUserForm({ ...userForm, name, email, target });
      setLoading(false);
    }
  }, [user]);

  const updateUserDB = async (user: User) => {
    try {
      const response = await fetch("/api/db/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, week }),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw error;
      }
      const { updatedUser, updatedWeekTargets } = await response.json();
      toast({ title: "User updated", status: "info" });
      return { updatedUser, updatedWeekTargets };
    } catch (error) {
      toast({ title: `${error}`, status: "error" });
    }
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;
    console.log(`PROP: ${name}, VAL: ${value}`);
    setUserForm({ ...userForm, [name]: value });
    setInteracted(true);
  };

  const submitHandler = async (e) => {
    event?.preventDefault();

    const user_id = user?.user_id || "";
    const userProps = { user_id, ...userForm };

    const response = await updateUserDB(userProps);

    setWeek(response?.updatedWeekTargets as Week);
    setUser({
      ...user,
      email: response?.updatedUser.email,
      name: response?.updatedUser.name,
      target: response?.updatedUser.target,
    });
    setInteracted(false);
  };

  const cancelHandler = (e) => {
    console.log(initUser.current);
    const init = initUser.current;
    if (!init) return;

    setUserForm({
      ...userForm,
      email: init.email,
      name: init.name,
      target: init.target,
    });
    setInteracted(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-96">
        <Spinner thickness="4px" speed="1s" color="teal.600" size="xl" />
      </div>
    );
  }

  return (
    <form onSubmit={submitHandler}>
      <Card className="w-96 mx-auto mt-52">
        <CardHeader className="text-teal-700 text-3xl font-bold">
          My Profile
        </CardHeader>
        <CardBody>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <InputGroup size="lg">
              <Input
                focusBorderColor="teal.600"
                placeholder="Your name"
                type="text"
                name="name"
                value={userForm?.name}
                onChange={changeHandler}
              />
            </InputGroup>
            <FormLabel className="pt-4">Email Address</FormLabel>
            <InputGroup size="lg">
              <Input
                focusBorderColor="teal.600"
                placeholder="email@example.com"
                type="email"
                name="email"
                value={userForm?.email}
                onChange={changeHandler}
              />
            </InputGroup>
            <FormLabel className="pt-4">Calorie Target</FormLabel>
            <NumberInput
              size="lg"
              focusBorderColor="teal.600"
              value={userForm?.target}
              onChange={
                (value) => changeHandler({ target: { name: "target", value } }) // workaround, since NumberInput does not return event.target props
              }
              min={1000}
              max={9999}
            >
              <NumberInputField />
            </NumberInput>
            <FormHelperText fontSize={12} ml={2}>
              min: 1000, max: 9999
            </FormHelperText>
          </FormControl>
        </CardBody>
        <CardFooter className="justify-end">
          <Button
            colorScheme="teal"
            mr={3}
            type="submit"
            isDisabled={!interacted}
          >
            Update
          </Button>
          <Button
            colorScheme="gray"
            mr={3}
            onClick={(e) => cancelHandler(e)}
            isDisabled={!interacted}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default ProfileForm;
