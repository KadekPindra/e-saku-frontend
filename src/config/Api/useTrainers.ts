import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ITrainer } from "../Models/Trainer";
import { ApiTrainer } from "../Services/Trainers.service";

export const useTrainer = () => {
  return useQuery<ITrainer[]>({
    queryKey: ["trainers"],
    queryFn: () => ApiTrainer.getAll(),
  });
};

export const useTrainerById = (id: number) => {
  return useQuery<ITrainer>({
    queryKey: ["trainer", id],
    queryFn: () => ApiTrainer.getById(id),
    enabled: !!id,
  });
};

export const useTrainerCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ITrainer>) => ApiTrainer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
    onError: (error) => {
      console.error("Error creating trainers:", error);
    },
  });
};

export const useTrainerUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ITrainer> }) =>
      ApiTrainer.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      queryClient.invalidateQueries({ queryKey: ["trainer", id] });
    },
    onError: (error) => {
      console.error("Error updating trainer:", error);
    },
  });
};

export const useTrainerUpdatePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ITrainer> }) =>
      ApiTrainer.updatePassword(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["trainer", id] });
    },
  });
};

export const useTrainerDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ApiTrainer.delete(id),
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: ["trainer", id] });
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
    onError: (error) => {
      console.error("Error deleting trainer:", error);
    },
  });
};
