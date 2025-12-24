import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Image as ImageIcon } from 'lucide-react';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';

export default function MediaManager() {
    const workspaceSlug = useWorkspaceSlug();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Placeholder states - will be replaced with actual API hooks
    const isLoading = false;
    const isError = false;
    const mediaItems: any[] = [];

    const handleUploadMedia = () => {
        // TODO: Implement media upload functionality
        console.log('Upload media');
    };

    const confirmDelete = () => {
        // TODO: Implement actual delete mutation
        setIsDeleteOpen(false);
    };

    const cancelDelete = () => {
        setIsDeleteOpen(false);
    };

    if (isLoading || !workspaceSlug) {
        return (
            <div className='p-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Skeleton className='h-6 w-40' />
                        </CardTitle>
                        <CardDescription>
                            <Skeleton className='h-4 w-64' />
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <Skeleton className='h-10 w-full' />
                        <div className='space-y-3'>
                            <Skeleton className='h-14 w-full' />
                            <Skeleton className='h-14 w-full' />
                            <Skeleton className='h-14 w-full' />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isError) {
        return (
            <div className='p-6'>
                <Card>
                    <CardHeader>
                        <div>
                            <CardTitle>Media</CardTitle>
                            <CardDescription>Manage your media files</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Empty className='border-dashed'>
                            <EmptyHeader>
                                <EmptyMedia variant='icon'>
                                    <ImageIcon />
                                </EmptyMedia>
                                <EmptyTitle>Error loading media</EmptyTitle>
                                <EmptyDescription>
                                    There was an error loading your media files. Please try again.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <>
            <div className='p-6'>
                <Card className='animate-in fade-in-50 zoom-in-95 duration-300'>
                    <CardHeader>
                        <div>
                            <CardTitle>Media</CardTitle>
                            <CardDescription>Manage your media files</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {mediaItems.length === 0 ? (
                            <Empty className='border-dashed animate-in fade-in-50'>
                                <EmptyHeader>
                                    <EmptyMedia variant='icon'>
                                        <ImageIcon />
                                    </EmptyMedia>
                                    <EmptyTitle>No Media Yet</EmptyTitle>
                                    <EmptyDescription>
                                        You haven't uploaded any media files yet. Get started by
                                        uploading your first file.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button onClick={handleUploadMedia} size='sm'>
                                        <Plus />
                                        Upload Media
                                    </Button>
                                </EmptyContent>
                            </Empty>
                        ) : (
                            <div className='space-y-4'>
                                <div className='flex justify-end'>
                                    <Button onClick={handleUploadMedia} size='sm'>
                                        <Plus />
                                        Upload Media
                                    </Button>
                                </div>
                                {/* TODO: Add media grid/list view here */}
                                <div className='text-sm text-muted-foreground'>
                                    Media items will be displayed here
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete media</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the
                            media file.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant='outline' onClick={cancelDelete}>
                            Cancel
                        </Button>
                        <Button variant='destructive' onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
