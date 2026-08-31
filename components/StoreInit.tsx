"use client";
import { useEffect } from "react";
import { useStoreSettings } from "@/store/useStoreSettings";

export default function StoreInit() {
  const { fetchSettings } = useStoreSettings();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return null; 
}