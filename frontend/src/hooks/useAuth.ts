import {
  apiGetMe,
  apiLogin,
  apiRegister,
  apiLogout,
  apiVerifyEmail,
} from '@/api/auth';
import type { VerifyEmailData } from '@/types/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useAuth() {
  return useQuery({
    queryKey: ['user'], // A unique key for this query
    queryFn: apiGetMe, // The API function to call
    retry: false, // Don't retry if it fails (e.g., user is not logged in)
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiLogin,
    // Connects this mutation to the apiLogin function(changes made during Login)
    onSuccess: () => {
      // Invalidate the user query so it refetches with new login data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiRegister,
    onSuccess: () => {
      // Invalidate the user query so it refetches with new registration data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiLogout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useVerifyEmail(data: VerifyEmailData) {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // delibrately delaying the verification process for 2 seconds
      return apiVerifyEmail(data);
    },
    onSuccess: () => {
      toast.success('Email verified successfully');
      navigate('/dashboard');
    },
    onError: () => {
      toast.error('Email verification failed');
    },
    retry: false,
  });
}
