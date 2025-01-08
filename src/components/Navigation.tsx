"use client";

import { useSession } from "@/app/context/SessionProvider";
import { Text, useToast } from "@chakra-ui/react";
import { faWeightScale } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const Navigation = () => {
  const toast = useToast();
  const router = useRouter();
  const currentPath = usePathname();
  const { session, authenticated, setSession } = useSession();

  const authStateHandler = async () => {
    if (session) {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
        });
        if (!response.ok) {
          const { error } = await response.json();
          throw error;
        }
        authenticated.current = false;
        setSession(null);
        router.push("/login");
        toast({ title: "Signed out", status: "info" });
      } catch (error) {
        toast({ title: `${error}`, status: "error" });
      }
    } else {
      router.push("/login");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center bg-teal-800 p-4 text-white lg:px-24">
        <Link href={session ? "/dashboard" : "/login"} className="flex items-center cursor-pointer text-2xl hover:text-teal-200">
          <FontAwesomeIcon className="h-10 pr-4" icon={faWeightScale} />
          <h3 className="hidden sm:block">Calorie Tracker</h3>
        </Link>
        <ul className="flex justify-end space-x-4 text-lg">
          {session && (
            <>
              <li className="hover:text-teal-200">
                <Link href={"/dashboard"}>
                  <Text className={currentPath === "/dashboard" ? "text-teal-200" : ""}>Dashboard</Text>
                </Link>
              </li>
              <li className="hover:text-teal-200">
                <Link href={"/profile"}>
                  <Text className={currentPath === "/profile" ? "text-teal-200" : ""}>Profile</Text>
                </Link>
              </li>
            </>
          )}
          <li className="hover:text-teal-200">
            <Link href={"/about"}>
              <Text className={currentPath === "/about" ? "text-teal-200" : ""}>About</Text>
            </Link>
          </li>
          <li className="hover:text-teal-200">
            <button onClick={authStateHandler}>{session ? "Sign Out" : "Sign In"}</button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Navigation;
