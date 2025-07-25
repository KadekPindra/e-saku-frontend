import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IRank } from "../Models/AccomplishmentsRanks";
import { ApiAccomplishmentsRank } from "../Services/Accomplishments.service";

// Fetch all ranks
export const useAccomplishmentsRanks = () => {
  return useQuery<IRank[]>({
    queryKey: ["accomplishments-ranks"],
    queryFn: () => ApiAccomplishmentsRank.getAll(),
  });
}

// Fetch rank by ID
export const useAccomplishmentsRankById = (id: number) => {
  return useQuery<IRank>({
    queryKey: ["accomplishments-ranks", id],
    queryFn: () => ApiAccomplishmentsRank.getById(id),
    enabled: !!id,
  });
}

// Create a new rank
export const useAccomplishmentsRankCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<IRank>) => ApiAccomplishmentsRank.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accomplishments-ranks"] });
    },
    onError: (error) => {
      console.error("Error creating rank:", error);
    },
  });
}

// Update an existing rank
export const useAccomplishmentsRankUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IRank> }) =>
      ApiAccomplishmentsRank.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accomplishments-ranks"] });
    },
    onError: (error) => {
      console.error("Error updating rank:", error);
    },
  });
}

// Delete a rank
export const useAccomplishmentsRankDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ApiAccomplishmentsRank.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accomplishments-ranks"] });
    },
    onError: (error) => {
      console.error("Error deleting rank:", error);
    },
  });
}
