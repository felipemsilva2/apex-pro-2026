
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export type ClientDocument = {
    id: string;
    client_id: string;
    tenant_id: string;
    title: string;
    file_url: string;
    file_type: 'pdf' | 'image' | 'other';
    category: string;
    created_at: string;
};

export function useDocuments() {
    const { profile, tenant } = useAuth();
    const queryClient = useQueryClient();

    const fetchDocuments = async () => {
        if (!profile?.id) return [];

        const { data, error } = await supabase
            .from('client_documents')
            .select('*')
            .eq('client_id', profile.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as ClientDocument[];
    };

    const uploadDocument = async (params: {
        uri: string;
        fileName: string;
        mimeType: string;
        title: string;
        category?: string;
    }) => {
        if (!profile?.id || !tenant?.id) throw new Error("Usuário não autenticado");

        const category = params.category || 'lab_exam';
        const fileExt = params.fileName.split('.').pop() || 'file';
        const formattedFileName = params.fileName.replace(/\s+/g, '_');
        const path = `${profile.id}/${Date.now()}_${formattedFileName}`;

        // 1. Upload to Storage
        const base64 = await FileSystem.readAsStringAsync(params.uri, { encoding: 'base64' });
        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(path, decode(base64), {
                contentType: params.mimeType,
                upsert: true
            });

        if (uploadError) throw uploadError;

        const publicUrl = supabase.storage.from('documents').getPublicUrl(path).data.publicUrl;
        const fileType = params.mimeType.includes('pdf') ? 'pdf' : params.mimeType.includes('image') ? 'image' : 'other';

        // 2. Insert into Database
        const { error: dbError } = await supabase
            .from('client_documents')
            .insert({
                client_id: profile.id,
                tenant_id: tenant.id,
                title: params.title,
                file_url: publicUrl,
                file_type: fileType,
                category: category
            });

        if (dbError) throw dbError;
    };

    const deleteDocument = async (id: string, fileUrl: string) => {
        // Extract path from URL for storage deletion
        // URL format: .../storage/v1/object/public/documents/USER_ID/FILENAME
        const path = fileUrl.split('/documents/')[1];

        if (path) {
            await supabase.storage.from('documents').remove([path]);
        }

        const { error } = await supabase
            .from('client_documents')
            .delete()
            .eq('id', id);

        if (error) throw error;
    };

    const { data: documents, isLoading, error } = useQuery({
        queryKey: ['documents', profile?.id],
        queryFn: fetchDocuments,
        enabled: !!profile?.id
    });

    const uploadMutation = useMutation({
        mutationFn: uploadDocument,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', profile?.id] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id, fileUrl }: { id: string; fileUrl: string }) => deleteDocument(id, fileUrl),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', profile?.id] });
        }
    });

    return {
        documents,
        isLoading,
        error,
        uploadDocument: uploadMutation.mutateAsync,
        isUploading: uploadMutation.isPending,
        deleteDocument: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending
    };
}
