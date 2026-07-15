import { useAuth, useLogout } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { EditProfileForm } from '@/components/EditProfileForm';
import { useEffect, useState } from 'react';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getLastWorkspaceSlugs } from '@/lib/utils';
import {
  useAIProvider,
  useDeleteAIProvider,
  useSaveAIProvider,
} from '@/hooks/useAIProvider';
import { ProfileOverviewCard } from '@/components/Profile/ProfileOverviewCard';
import { ProfileSettingsList } from '@/components/Profile/ProfileSettingsList';
import { AISettingsPanel } from '@/components/Profile/AISettingsPanel';

export function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: user, isLoading, isError } = useAuth();
  const logoutMutation = useLogout();
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const { data: aiProvider, isLoading: isAiLoading } = useAIProvider();
  const saveAIProviderMutation = useSaveAIProvider();
  const deleteAIProviderMutation = useDeleteAIProvider();
  const isEditingView = searchParams.has('edit');
  const isAiView = searchParams.has('ai') && !isEditingView;

  useHead(
    createSEOMetadata({
      title: 'Profile',
      description: 'Manage your profile and account settings',
      noindex: true,
    }),
  );

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  const openEdit = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('ai');
    next.set('edit', 'true');
    setSearchParams(next);
  };

  const closeEdit = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('edit');
    setSearchParams(next);
  };

  useEffect(() => {
    if (aiProvider?.model) {
      setModel(aiProvider.model);
    }
  }, [aiProvider?.model]);

  const handleSaveGeminiKey = () => {
    const trimmedKey = geminiApiKey.trim();
    const trimmedModel = model.trim();

    if (!trimmedKey) {
      return;
    }

    saveAIProviderMutation.mutate(
      {
        apiKey: trimmedKey,
        model: trimmedModel || undefined,
      },
      {
        onSuccess: () => {
          setGeminiApiKey('');
        },
      },
    );
  };

  const handleDeleteGeminiKey = () => {
    deleteAIProviderMutation.mutate();
  };

  const openAiSettings = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('edit');
    next.set('ai', 'true');
    setSearchParams(next);
  };

  const closeAiSettings = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('ai');
    setSearchParams(next);
  };

  const aiStatusText = isAiLoading
    ? 'Checking...'
    : aiProvider?.hasKey
      ? 'Configured'
      : 'Not configured';

  const handleBack = () => {
    if (isEditingView) {
      closeEdit();
      return;
    }

    if (isAiView) {
      closeAiSettings();
      return;
    }

    const { current, previous } = getLastWorkspaceSlugs();
    const targetWorkspaceSlug = current ?? previous;

    if (targetWorkspaceSlug) {
      navigate(`/dashboard/${targetWorkspaceSlug}`);
      return;
    }

    navigate('/workspaces');
  };

  return (
    <ScrollArea className='h-screen'>
      <div className='h-screen w-screen p-8'>
        <div className='mx-auto flex min-h-full w-full max-w-2xl items-center justify-center'>
          <div className='w-full space-y-8'>
            <section className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={handleBack}
                >
                  <ArrowLeft className='h-4 w-4' />
                </Button>
                <div>
                  <h1 className='text-2xl font-semibold tracking-tight'>
                    {isAiView ? 'AI Settings' : 'Profile'}
                  </h1>
                  <p className='text-sm text-muted-foreground'>
                    {isAiView
                      ? 'Manage your Gemini BYOK configuration.'
                      : 'Manage your account and personal settings.'}
                  </p>
                </div>
              </div>
            </section>

            {isLoading && (
              <section>
                <Skeleton className='h-[320px] w-full rounded-lg' />
              </section>
            )}
            {isError && !isLoading && (
              <section>
                <div className='rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive'>
                  Error loading profile.
                </div>
              </section>
            )}
            {user && (
              <>
                {isEditingView ? (
                  <section>
                    <div className='mx-auto w-full max-w-2xl'>
                      <EditProfileForm
                        user={user}
                        onCancel={closeEdit}
                        onSuccess={closeEdit}
                      />
                    </div>
                  </section>
                ) : (
                  <>
                    {!isAiView && (
                      <>
                        <section>
                          <ProfileOverviewCard
                            name={user.name}
                            email={user.email}
                            isLoggingOut={logoutMutation.isPending}
                            onEdit={openEdit}
                            onLogout={handleLogout}
                          />
                        </section>

                        <section>
                          <ProfileSettingsList
                            aiStatusText={aiStatusText}
                            onOpenAiSettings={openAiSettings}
                          />
                        </section>
                      </>
                    )}

                    {isAiView && (
                      <section>
                        <div className='space-y-4'>
                          <AISettingsPanel
                            geminiApiKey={geminiApiKey}
                            model={model}
                            statusText={aiStatusText}
                            isSaving={saveAIProviderMutation.isPending}
                            isRemoving={deleteAIProviderMutation.isPending}
                            hasKey={Boolean(aiProvider?.hasKey)}
                            onApiKeyChange={setGeminiApiKey}
                            onModelChange={setModel}
                            onSave={handleSaveGeminiKey}
                            onRemove={handleDeleteGeminiKey}
                          />
                        </div>
                      </section>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
