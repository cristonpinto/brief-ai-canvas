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

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(uploadError.message || 'Failed to upload file to storage');
      }

      // Create document record in database
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_type: file.type || 'application/octet-stream',
          file_size: file.size,
          storage_path: filePath,
          status: 'pending' // Will be processed by Edge Function
        })
        .select()
        .single();

      if (docError) {
        console.error('Database insert error:', docError);
        // Try to clean up the uploaded file
        await supabase.storage.from('documents').remove([filePath]);
        throw new Error(docError.message || 'Failed to save document record');
      }

      return docData.id;
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
