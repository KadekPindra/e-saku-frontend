import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiRules } from "../Services/Rules.service";
import { IRules } from "../Models/Rules";

//fetch all rules
export const useRules = () => {
  return useQuery<IRules[]>({
    queryKey: ["rules"],
    queryFn: () => ApiRules.getAll(),
  });
};

//get rules by id
export const useRulesById = (id: number) => {
  return useQuery<IRules>({
    queryKey: ["rules-of-conduct", id],
    queryFn: () => ApiRules.getById(id),
    enabled: !!id,
  });
};

//create rules
export const useRulesCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ApiRules.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
    onError: (error) => {
      console.error("Error creating rules:", error);
    },
  });
};

//update rules
export const useRulesUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IRules }) =>
      ApiRules.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      queryClient.invalidateQueries({ queryKey: ["rules-of-conduct", id] });
    },
    onError: (error) => {
      console.error("Error updated rules:", error);
    },
  });
};

//delete rules
export const useRulesDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ApiRules.delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["rules"], (oldData: IRules[] | undefined) =>
        oldData ? oldData.filter((rules) => rules.id !== id) : []
      );
    },
  });
};
