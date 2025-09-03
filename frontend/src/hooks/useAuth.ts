import { apiRegister } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";

export function useRegister(){
    return useMutation({
        mutationFn: async () => apiRegister,
    })

}