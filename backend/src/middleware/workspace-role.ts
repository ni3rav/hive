import { NextFunction, Request, Response } from 'express';
import { ROLE_HIERARCHY } from '../utils/roles';
import { forbidden } from '../utils/responses';

export function requireMinRole(minRole: 'admin' | 'owner') {
  return function (req: Request, res: Response, next: NextFunction) {
    const role = (req.workspaceRole || 'member') as
      | 'owner'
      | 'admin'
      | 'member';
    if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[minRole]) {
      return forbidden(res, 'Insufficient role for this action');
    }
    next();
  };
}
