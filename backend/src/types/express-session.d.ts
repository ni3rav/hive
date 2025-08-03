import "express";

declare module "express" {
  interface Request {
    session?: {
      id: string;
      userId: string;
      createdAt: Date;
      expiresAt: Date;
    };
  }
}
