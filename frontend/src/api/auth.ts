import {apiPost} from '@/lib/api-client';

export async function apiRegister(){
    return apiPost('/auth/register');
}