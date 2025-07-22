"use server";

import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/lib/auth";

export const getEntrepriseId = async () => {
  const user = await getAuthenticatedUser();
  if (user && user.entrepriseId) {
    return user.entrepriseId;
  }
  return null;
};