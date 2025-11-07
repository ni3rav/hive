import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreVertical, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import type { Member, PendingInvitation, MemberRole } from '@/types/member';
import { ROLE_HIERARCHY } from '@/types/member';

type Props = {
  members: Member[];
  invitations: PendingInvitation[];
  currentUserRole: MemberRole;
  currentUserId: string;
  workspaceSlug: string;
  onEdit: (member: Member) => void;
  onRemove: (member: Member) => void;
  onRevokeInvitation: (invitation: PendingInvitation) => void;
  onLeave: () => void;
};

function canManageMember(
  currentRole: MemberRole,
  targetRole: MemberRole,
): boolean {
  return ROLE_HIERARCHY[currentRole] > ROLE_HIERARCHY[targetRole];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function RoleBadge({ role }: { role: MemberRole }) {
  return (
    <Badge variant='secondary' className='font-normal'>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
}

export default function MemberList({
  members,
  //
  currentUserRole,
  currentUserId,
  workspaceSlug,
  onEdit,
  onRemove,
  //onRevokeInvitation,
  onLeave,
}: Props) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q),
    );
  }, [members, search]);

  const canInvite = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <Card className='animate-in fade-in-50 zoom-in-95 duration-300'>
      <CardHeader className='gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <CardTitle>Members</CardTitle>
          <CardDescription>Manage workspace members</CardDescription>
        </div>
        <div className='flex w-full gap-2 sm:w-auto'>
          <div className='relative flex-1 sm:flex-initial'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search team members...'
              className='pl-9 sm:w-64'
            />
          </div>
          {canInvite && (
            <Button
              onClick={() => navigate(`/dashboard/${workspaceSlug}/members/invite`)}
            >
              <Plus size={16} className='mr-1' />
              Invite
            </Button>
          )}
          {currentUserRole !== 'owner' && (
            <Button variant='outline' onClick={onLeave}>
              Leave Team
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div>
          <div className='mb-3 text-sm font-medium'>Current Members</div>
          {filteredMembers.length === 0 ? (
            <Empty className='border-dashed'>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <UserX />
                </EmptyMedia>
                <EmptyTitle>No Members</EmptyTitle>
                <EmptyDescription>
                  {search
                    ? `No members found matching "${search}"`
                    : 'No members in this workspace'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className='divide-y'>
              {filteredMembers.map((member, idx) => {
                const isCurrentUser = member.userId === currentUserId;
                const canEdit = canManageMember(currentUserRole, member.role);
                const canDelete =
                  canManageMember(currentUserRole, member.role) &&
                  !isCurrentUser;

                return (
                  <div
                    key={member.userId}
                    className='flex items-center justify-between py-3 animate-in fade-in-50 slide-in-from-bottom-1 duration-300'
                    style={{ animationDelay: `${Math.min(idx, 6) * 40}ms` }}
                  >
                    <div className='flex min-w-0 items-center gap-3'>
                      <Avatar className='h-9 w-9'>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0'>
                        <div className='truncate font-medium'>
                          {member.name}
                          {isCurrentUser && ' (You)'}
                        </div>
                        <div className='truncate text-sm text-muted-foreground'>
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <RoleBadge role={member.role} />
                      {(canEdit || canDelete) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            {canEdit && (
                              <DropdownMenuItem onClick={() => onEdit(member)}>
                                Edit Role
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={() => onRemove(member)}
                                className='text-destructive'
                              >
                                Remove
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* {invitations.length > 0 && (
          <div>
            <div className='mb-3 text-sm font-medium'>Pending Invitations</div>
            <div className='divide-y'>
              {invitations.map((invitation, idx) => {
                const canRevoke = canManageMember(
                  currentUserRole,
                  invitation.role,
                );

                return (
                  <div
                    key={invitation.id}
                    className='flex items-center justify-between py-3 animate-in fade-in-50 slide-in-from-bottom-1 duration-300'
                    style={{ animationDelay: `${Math.min(idx, 6) * 40}ms` }}
                  >
                    <div className='flex min-w-0 items-center gap-3'>
                      <Avatar className='h-9 w-9'>
                        <AvatarFallback>
                          {invitation.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0'>
                        <div className='truncate font-medium'>
                          {invitation.email}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <RoleBadge role={invitation.role} />
                      {canRevoke && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={() => onRevokeInvitation(invitation)}
                              className='text-destructive'
                            >
                              Revoke
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {invitations.length === 0 && (
          <div>
            <div className='mb-3 text-sm font-medium'>Pending Invitations</div>
            <Empty className='border-dashed'>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <UserX />
                </EmptyMedia>
                <EmptyTitle>No Pending Invitations</EmptyTitle>
                <EmptyDescription>
                  No pending invitations at this time
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}

