import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const getURL = () => {
  let url =
    import.meta.env.VITE_PUBLIC_SITE_URL ??  
    import.meta.env.VERCEL_URL ?? 
    "http://localhost:5173/";

  url = url.startsWith("http") ? url : `https://${url}`;
  url = url.endsWith("/") ? url : `${url}/`;
  return url;
};
export const getBackendURL = (): string => {
  if (import.meta.env.DEV) {
    return "http://localhost:10000";
  } else {
    return "https://lms-backend-api-d1wl.onrender.com"; 
  }
};

export const formatDateInput = (d: string | Date) => {
    const date = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };