import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const getURL = () => {
  let url =
    import.meta.env.VITE_PUBLIC_SITE_URL ??  
    import.meta.env.VITE_PUBLIC_VERCEL_URL ?? 
    "http://localhost:5173/";

  url = url.startsWith("http") ? url : `https://${url}`;
  url = url.endsWith("/") ? url : `${url}/`;
  return url;
};