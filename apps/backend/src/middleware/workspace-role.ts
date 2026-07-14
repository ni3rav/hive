import { NextFunction, Request, Response } from 'express';
import { MemberRole, ROLE_HIERARCHY } from '../utils/roles';
import { forbidden } from '../utils/responses';

export function requireMinRole(minRole: MemberRole) {
  return function (req: Request, res: Response, next: NextFunction) {
    const role = (req.workspaceRole || 'member') as MemberRole;
    if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[minRole]) {
      return forbidden(res, 'Insufficient role for this action');
    }
    next();
  };
}
