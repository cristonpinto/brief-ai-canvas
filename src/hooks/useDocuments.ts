import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: string;
  created_at: string;
  updated_at: string;
  upload_path?: string;
}

export const useDocuments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<string> => {
      if (!user) throw new Error('User not authenticated');

      const formData = new FormData();
      formData.append('file', file);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await fetch(`https://zahkvkvsfdikdzeftwkr.supabase.co/functions/v1/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      return result.document_id; // Return the document ID
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: "Upload completed",
        description: "Your document has been successfully uploaded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: "Document deleted",
        description: "The document has been removed from your uploads.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['documents'] });
  };

  return {
    documents,
    isLoading,
    uploadDocument: uploadMutation.mutateAsync, // Use mutateAsync to get the return value
    deleteDocument: deleteMutation.mutate,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch,
  };
};
