import { apiLogin, apiRegister } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";

export function useLogin() {
  return useMutation({
    mutationFn: apiLogin, 
    // Connects this mutation to the apiLogin function(changes made during Login)
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: apiRegister, 
    // Connects this mutation to the apiRegister function(changes made during Registration)
  });
}