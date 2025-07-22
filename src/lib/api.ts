"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from "axios";
import { cookies } from "next/headers";

export async function fetchJSON(url: string) {
  const token = (await cookies()).get("token")?.value;


  // if (!token) return [];
  try {
    const res = await fetch(`${url}`, {
      headers: {
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : undefined
      },
    });    

    if (res.ok) {
      return await res.json();
    }
    return [];
  } catch (error) {
    
    return [];
  }
}


export async function createdOrUpdated({
    url,
    data,
    updated = false
}: { 
    url: string;
    data: any;
    updated?: boolean;
}) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        console.error("🚨 Token manquant !");
        throw new Error("Token manquant");
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    let res;
    try {
        if (!updated) {
            res = await axios.post(url, data, { headers });
        } else {
            res = await axios.put(url, data, { headers });
        }

        return res.data;
    } catch (error: any) {
        console.error("💥 Erreur API :", error.response?.data || error.message);
        throw error;
    }
}
