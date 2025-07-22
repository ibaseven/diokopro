"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/actions/login";
import { verifyOtp } from "@/actions/verifyOtp";
import { LoginFormView } from "./login-form-view";
import { OtpFormView } from "./otp-form-view";

const LoginForm = () => {
  const router = useRouter();
  const [state, setState] = useState({
    requiresOtp: false,
    email: "",
    message: "",
    type: "",
    errors: {},
  });

  const [otpState, setOtpState] = useState({
    type: "",
    message: "",
    url: "",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const handleLogin = async (formData: FormData) => {
    const result = await login(null, formData);
    setState({
      requiresOtp: result.requiresOtp || false,
      email: result.email || "",
      message: result.message || "",
      type: result.type || "",
      errors: result.errors || {}
    });
  };

  const handleVerifyOtp = async (formData: FormData) => {
    const result = await verifyOtp(null, formData);
    const entrepriseId = formData.get('entrepriseId');

    console.log("ID de l'entreprise:", entrepriseId);

    setOtpState({
      type: result.type || "",
      message: result.message || "",
      url: result.url || ""
    });

    if (result.type === "redirect" && result.url) {
      router.push(result.url);
    }
  };

  useEffect(() => {
    if (otpState.type === "redirect") {
      router.push(otpState.url);
    }
  }, [otpState, router]);

  return (
    <div className="w-full md:w-1/2 p-8">
      {!state.requiresOtp ? (
        <LoginFormView
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          state={state}
          handleLogin={handleLogin}
        />
      ) : (
        <OtpFormView
            otp={otp}
            setOtp={setOtp}
            email={email}
            otpState={otpState}
            handleVerifyOtp={handleVerifyOtp} entrepriseId={""}        />
      )}
    </div>
  );
};

export default LoginForm;