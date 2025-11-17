import React from "react";
import LoginForm from "../../../features/Auth/components/LoginForm";
import illustration from "../../../assets/images/login.jpg";


export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#DCEDFF] via-[#94B0DA] to-[#8F91A2]">
      <div className="bg-[#FFFFFFEE] backdrop-blur-md rounded-3xl shadow-2xl flex flex-col md:flex-row max-w-4xl w-full overflow-hidden">
        
        {/* Illustration img*/}
        {/* <div className="hidden md:flex w-1/2 bg-gradient-to-tr from-[#94B0DA] to-[#8F91A2] items-center justify-center">
          <img
            src={illustration}
            alt="AI CV illustration"
            className="p-10 w-3/4 h-auto"
          />
        </div> */}

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
}
