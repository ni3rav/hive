import { apiGetMe, apiLogin, apiRegister, apiLogout } from "@/api/auth";
import { useQuery, useMutation } from "@tanstack/react-query";

export function useAuth() {
  return useQuery({
    queryKey: ["user"], // A unique key for this query
    queryFn: apiGetMe,  // The API function to call
    retry: false,       // Don't retry if it fails (e.g., user is not logged in)
  });
}

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

export function useLogout() {
  return useMutation({
    mutationFn: apiLogout,
  });
}