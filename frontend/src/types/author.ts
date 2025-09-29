export interface Author {
    name: string;
    email: string;
    about?: string;
    socialLinks?: Record<string, string>;
}