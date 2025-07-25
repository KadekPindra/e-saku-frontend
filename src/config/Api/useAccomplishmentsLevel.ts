import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ILevel } from "../Models/AccomplishmentsLevel";
import { ApiAccomplishmentsLevel } from "../Services/Accomplishments.service";

// Fetch all levels
export const useAccomplishmentsLevel = () => {
  return useQuery<ILevel[]>({
    queryKey: ['accomplishments-levels'],
    queryFn: () => ApiAccomplishmentsLevel.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Fetch level by ID
export const useAccomplishmentsLevelById = (id: number) => {
  return useQuery<ILevel>({
    queryKey: ["accomplishments-levels", id],
    queryFn: () => ApiAccomplishmentsLevel.getById(id),
    enabled: !!id,
  });
}
// Create a new level
export const useAccomplishmentsLevelCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ILevel>) => ApiAccomplishmentsLevel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accomplishments-levels"] });
    },
    onError: (error) => {
      console.error("Error creating level:", error);
    },
  });
}

// Update an existing level
export const useAccomplishmentsLevelUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ILevel> }) =>
      ApiAccomplishmentsLevel.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accomplishments-levels"] });
    },
    onError: (error) => {
      console.error("Error updating level:", error);
    },
  });
}

// Delete a level
export const useAccomplishmentsLevelDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ApiAccomplishmentsLevel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accomplishments-levels"] });
    },
    onError: (error) => {
      console.error("Error deleting level:", error);
    },
  });
}


