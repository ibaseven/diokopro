import React from "react";
export default function CustomInputError({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-1   text-red-600 ">
      <span className=" text-[12]">{children}</span>
    </p>
  );
}