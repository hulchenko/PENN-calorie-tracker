import SignInForm from "@/app/login/SignInForm";
import SignUpForm from "@/app/login/SignUpForm";

const LoginPage = async () => {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-32 text-xl">
      <h1 className="text-3xl lg:text-6xl p-6">
        Lead your healthy <span className="text-teal-700">life</span> here!
      </h1>
      <SignInForm />
      <SignUpForm />
    </div>
  );
};

export default LoginPage;
