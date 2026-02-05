import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AssessmentService } from '@/api/services/assessmentService';
import { CreateAssessmentInput, UpdateAssessmentInput } from '@/types/assessment';
import { toast } from 'sonner';

/**
 * Hook to fetch all assessments for a client
 */
export function useClientAssessments(clientId: string | undefined) {
    return useQuery({
        queryKey: ['assessments', clientId],
        queryFn: () => AssessmentService.getClientAssessments(clientId!),
        enabled: !!clientId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1, // Only retry once
        retryDelay: 500, // Wait 500ms before retry
    });
}

/**
 * Hook to fetch the latest assessment for a client
 */
export function useLatestAssessment(clientId: string | undefined) {
    return useQuery({
        queryKey: ['assessments', clientId, 'latest'],
        queryFn: () => AssessmentService.getLatestAssessment(clientId!),
        enabled: !!clientId,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook to fetch a specific assessment
 */
export function useAssessment(assessmentId: string | undefined) {
    return useQuery({
        queryKey: ['assessments', assessmentId],
        queryFn: () => AssessmentService.getAssessment(assessmentId!),
        enabled: !!assessmentId,
    });
}

/**
 * Hook to create a new assessment
 */
export function useCreateAssessment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateAssessmentInput) =>
            AssessmentService.createAssessment(input),
        onSuccess: (data) => {
            // Invalidate queries for this client
            queryClient.invalidateQueries({ queryKey: ['assessments', data.client_id] });
            queryClient.invalidateQueries({ queryKey: ['clients', data.client_id] });
            toast.success('Avaliação registrada com sucesso!');
        },
        onError: (error: any) => {
            console.error('Error creating assessment:', error);
            toast.error('Erro ao salvar avaliação', {
                description: error.message || 'Tente novamente.',
            });
        },
    });
}

/**
 * Hook to update an assessment
 */
export function useUpdateAssessment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: UpdateAssessmentInput }) =>
            AssessmentService.updateAssessment(id, input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['assessments', data.client_id] });
            queryClient.invalidateQueries({ queryKey: ['assessments', data.id] });
            toast.success('Avaliação atualizada com sucesso!');
        },
        onError: (error: any) => {
            console.error('Error updating assessment:', error);
            toast.error('Erro ao atualizar avaliação', {
                description: error.message || 'Tente novamente.',
            });
        },
    });
}

/**
 * Hook to delete an assessment
 */
export function useDeleteAssessment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, clientId }: { id: string; clientId: string }) =>
            AssessmentService.deleteAssessment(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['assessments', variables.clientId] });
            toast.success('Avaliação excluída com sucesso!');
        },
        onError: (error: any) => {
            console.error('Error deleting assessment:', error);
            toast.error('Erro ao excluir avaliação', {
                description: error.message || 'Tente novamente.',
            });
        },
    });
}
