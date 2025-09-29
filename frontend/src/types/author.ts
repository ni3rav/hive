export interface Author {
  id?: string; 
  name: string;
  email: string;
  about?: string;
  socialLinks?: Record<string, string>; 
}