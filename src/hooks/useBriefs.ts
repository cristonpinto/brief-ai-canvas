import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface BriefCard {
  id: string;
  type: "summary" | "keypoints" | "actions" | "decisions";
  title: string;
  content: string;
  isEditing: boolean;
}

export interface Brief {
  id: string;
  title: string;
  brief_type: string;
  content: BriefCard[];
  source_documents: string[];
  created_at: string;
  updated_at: string;
}

export const useBriefs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: briefs = [], isLoading } = useQuery({
    queryKey: ["briefs", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("briefs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Parse the content JSON back to BriefCard[]
      return data.map((brief) => ({
        ...brief,
        content:
          typeof brief.content === "string"
            ? JSON.parse(brief.content)
            : brief.content,
      })) as Brief[];
    },
    enabled: !!user,
  });

  const saveBriefMutation = useMutation({
    mutationFn: async ({
      title,
      briefType,
      cards,
      sourceDocuments = [],
    }: {
      title: string;
      briefType: string;
      cards: BriefCard[];
      sourceDocuments?: string[];
    }): Promise<string> => {
      if (!user) throw new Error("User not authenticated");

      // Clean the cards data for storage (remove isEditing)
      const cleanCards = cards.map((card) => ({
        id: card.id,
        type: card.type,
        title: card.title,
        content: card.content,
      }));

      const { data, error } = await supabase
        .from("briefs")
        .insert({
          title,
          brief_type: briefType,
          content: cleanCards,
          source_documents: sourceDocuments,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefs"] });
      toast({
        title: "Brief saved",
        description: "Your brief has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBriefMutation = useMutation({
    mutationFn: async ({
      id,
      title,
      cards,
    }: {
      id: string;
      title: string;
      cards: BriefCard[];
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Clean the cards data for storage
      const cleanCards = cards.map((card) => ({
        id: card.id,
        type: card.type,
        title: card.title,
        content: card.content,
      }));

      const { error } = await supabase
        .from("briefs")
        .update({
          title,
          content: cleanCards,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefs"] });
      toast({
        title: "Brief updated",
        description: "Your changes have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBriefMutation = useMutation({
    mutationFn: async (briefId: string) => {
      const { error } = await supabase
        .from("briefs")
        .delete()
        .eq("id", briefId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefs"] });
      toast({
        title: "Brief deleted",
        description: "The brief has been removed.",
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

  const generateBriefMutation = useMutation({
    mutationFn: async ({
      documentIds,
      briefTitle,
      briefType,
    }: {
      documentIds: string[];
      briefTitle: string;
      briefType: string;
    }) => {
      // For now, generate a local brief without AI (Edge Functions not deployed)
      // This creates a template brief that users can edit manually
      const mockBrief = {
        brief: [
          {
            id: `summary-${Date.now()}`,
            type: "summary",
            title: "Executive Summary",
            content: `This is a brief generated for "${briefTitle}". Edit this section to add your executive summary based on the selected documents.`,
            isEditing: false,
          },
          {
            id: `keypoints-${Date.now()}`,
            type: "keypoints",
            title: "Key Points",
            content:
              "• Key point 1 - Edit to add your findings\n• Key point 2 - Add important insights\n• Key point 3 - Include relevant data",
            isEditing: false,
          },
          {
            id: `actions-${Date.now()}`,
            type: "actions",
            title: "Action Items",
            content:
              "• Action item 1 - Define next steps\n• Action item 2 - Assign responsibilities\n• Action item 3 - Set deadlines",
            isEditing: false,
          },
          {
            id: `decisions-${Date.now()}`,
            type: "decisions",
            title: "Key Decisions",
            content:
              "• Decision 1 - Document important decisions\n• Decision 2 - Record outcomes\n• Decision 3 - Note any pending items",
            isEditing: false,
          },
        ],
        sourceDocuments: `${documentIds.length} document(s) selected`,
        totalChunks: 0,
      };

      return mockBrief;
    },
    onSuccess: () => {
      toast({
        title: "Brief generated",
        description:
          "Your brief template has been created. Edit the sections to add your content.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    briefs,
    isLoading,
    saveBrief: saveBriefMutation.mutateAsync,
    updateBrief: updateBriefMutation.mutateAsync,
    deleteBrief: deleteBriefMutation.mutate,
    generateBrief: generateBriefMutation.mutateAsync,
    isSaving: saveBriefMutation.isPending,
    isUpdating: updateBriefMutation.isPending,
    isDeleting: deleteBriefMutation.isPending,
    isGenerating: generateBriefMutation.isPending,
  };
};
