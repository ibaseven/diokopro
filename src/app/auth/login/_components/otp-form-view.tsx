import { AlertFeedback } from "@/components/alert-feedback";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import logoDioko from "../../../../../public/img/NewDiokoDeseign.png";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRef } from "react";

interface OtpFormViewProps {
  otp: string;
  setOtp: (value: string) => void;
  email: string;
  otpState: any;
  handleVerifyOtp: (formData: FormData) => Promise<void>;
  entrepriseId: string;
}

export const OtpFormView = ({
  otp,
  setOtp,
  email,
  otpState,
  handleVerifyOtp,
  entrepriseId,
}: OtpFormViewProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('otp', otp);
      formData.append('entrepriseId', entrepriseId);
      handleVerifyOtp(formData);
    }
  };

  return (
    <>
      <div className="py-8 flex items-center justify-center">
        <div className="w-36">
          <Link href="/">
            <Image
              src={logoDioko}
              alt="Image d'authentification"
              className="object-contain"
            />
          </Link>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Verify OTP</h2>
        <p className="text-gray-600">Enter the OTP sent to your email</p>
      </div>
      <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="otp">OTP</Label>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} {...slot} index={index} />
                ))}
              </InputOTPGroup>
            )}
          />
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="otp" value={otp} />
          <input type="hidden" name="entrepriseId" value={entrepriseId} />
        </div>
        <AlertFeedback type={otpState?.type} message={otpState?.message} />
        <Button 
          type="submit" 
          className="w-full"
          disabled={otp.length !== 6}
        >
          Vérifier le code
        </Button>
      </form>
    </>
  );
};

export default OtpFormView;