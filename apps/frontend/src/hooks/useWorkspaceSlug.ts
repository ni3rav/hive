import { useParams } from 'react-router-dom';

export function useWorkspaceSlug(): string | undefined {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  return workspaceSlug;
}
