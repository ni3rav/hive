import MediaManager from '@/components/Media/MediaManager';
import { useHead } from '@unhead/react';
import { createSEOMetadata } from '@/lib/seo';

export default function MediaPage() {
    useHead(
        createSEOMetadata({
            title: 'Media',
            description: 'Manage media in your workspace',
            noindex: true,
        }),
    );

    return <MediaManager />;
}
