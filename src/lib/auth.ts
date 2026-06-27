import { supabase } from "./supabase";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Manual auth using simple database table
export const createUser = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string(), password: z.string(), name: z.string() }))
  .handler(async ({ data }) => {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", data.email)
      .single();
    
    if (existing) throw new Error("Email already registered");

    const { data: user, error } = await supabase
      .from("users")
      .insert([{ email: data.email, password: data.password, name: data.name }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return user;
  });

export const loginUser = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string(), password: z.string() }))
  .handler(async ({ data }) => {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", data.email)
      .eq("password", data.password)
      .single();

    if (error || !user) throw new Error("Invalid email or password");
    return user;
  });

// Auth state listeners
const listeners: Array<(user: any) => void> = [];

function notifyListeners(user: any) {
  listeners.forEach(cb => cb(user));
}

export async function signUp(email: string, password: string, name: string) {
  const user = await createUser({ data: { email, password, name } });
  localStorage.setItem("user", JSON.stringify(user));
  notifyListeners(user);
  return { session: { user } };
}

export async function signIn(email: string, password: string) {
  const user = await loginUser({ data: { email, password } });
  localStorage.setItem("user", JSON.stringify(user));
  notifyListeners(user);
  return { session: { user } };
}

export async function signOut() {
  localStorage.removeItem("user");
  notifyListeners(null);
}

export async function getUser() {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
}

export function onAuthChange(cb: (user: any) => void) {
  listeners.push(cb);
  
  // Call immediately with current state
  getUser().then(cb);
  
  return { 
    data: { 
      subscription: { 
        unsubscribe: () => {
          const index = listeners.indexOf(cb);
          if (index > -1) listeners.splice(index, 1);
        } 
      } 
    } 
  };
}