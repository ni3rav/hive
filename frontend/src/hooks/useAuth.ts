import { apiGetMe, apiLogin, apiRegister, apiLogout } from "@/api/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  return useQuery({
    queryKey: ["user"], // A unique key for this query
    queryFn: apiGetMe,  // The API function to call
    retry: false,       // Don't retry if it fails (e.g., user is not logged in)
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiLogin, 
    // Connects this mutation to the apiLogin function(changes made during Login)
    onSuccess: () => {
      // Invalidate the user query so it refetches with new login data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiRegister, 
    onSuccess: () => {
      // Invalidate the user query so it refetches with new registration data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiLogout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}