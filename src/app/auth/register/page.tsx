import React from "react";
import RegistrationForm from "./_components/registerForm";
import Image from "next/image";
import logoright from "../../../../public/img/logoLogin.png"


const RegisterForm = async () => {

  return (
    <div className="">
      <div className="">
        <RegistrationForm/>

        <div className="hidden bg-gray-100 md:block w-full md:w-1/2 relative  md:h-auto">
      
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;