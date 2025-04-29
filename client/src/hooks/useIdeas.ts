import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Idea, InsertIdea } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type SortOption = "rank-desc" | "rank-asc" | "recent";

export interface SortOptionType {
  value: SortOption;
  label: string;
}

export function useIdeas() {
  const [currentSort, setCurrentSort] = useState<SortOption>("recent");
  const { toast } = useToast();

  // Define sort options
  const sortOptions: SortOptionType[] = [
    { value: "rank-desc", label: "Highest Ranked First" },
    { value: "rank-asc", label: "Lowest Ranked First" },
    { value: "recent", label: "Most Recent First" },
  ];

  // Fetch all ideas
  const {
    data: ideas = [],
    isLoading,
    refetch,
  } = useQuery<Idea[]>({
    queryKey: ["/api/ideas"],
  });

  // Create a new idea
  const { mutateAsync: createIdea, isPending: isCreating } = useMutation({
    mutationFn: async (idea: InsertIdea) => {
      const res = await apiRequest("POST", "/api/ideas", idea);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "Idea created",
        description: "Your idea has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create idea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update an existing idea
  const { mutateAsync: updateIdea, isPending: isUpdating } = useMutation({
    mutationFn: async (data: InsertIdea & { id: number }) => {
      const { id, ...ideaData } = data;
      const res = await apiRequest("PUT", `/api/ideas/${id}`, ideaData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "Idea updated",
        description: "Your idea has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update idea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete an idea
  const { mutateAsync: deleteIdea, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/ideas/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "Idea deleted",
        description: "Your idea has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete idea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update an idea's rank
  const { mutateAsync: updateIdeaRank } = useMutation({
    mutationFn: async ({ id, rank }: { id: number; rank: number }) => {
      const res = await apiRequest("PATCH", `/api/ideas/${id}/rank`, { rank });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update rank",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sort ideas based on current sort option
  const sortedIdeas = [...ideas].sort((a, b) => {
    if (currentSort === "rank-desc") {
      return b.rank - a.rank;
    } else if (currentSort === "rank-asc") {
      return a.rank - b.rank;
    } else {
      // "recent" - sort by most recently modified
      return new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime();
    }
  });

  // Function to change sort option
  const sort = (option: SortOption) => {
    setCurrentSort(option);
  };

  return {
    ideas: sortedIdeas,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createIdea: async (idea: InsertIdea) => {
      await createIdea(idea);
      return true;
    },
    updateIdea: async (data: InsertIdea & { id: number }) => {
      await updateIdea(data);
      return true;
    },
    deleteIdea: async (id: number) => {
      await deleteIdea(id);
      return true;
    },
    updateIdeaRank: async (id: number, rank: number) => {
      await updateIdeaRank({ id, rank });
      return true;
    },
    refetch,
    sort,
    currentSort,
    sortOptions,
  };
}
