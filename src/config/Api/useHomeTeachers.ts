import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IHomeTeacher } from "../Models/HomeTeachers";
import { ApiHomeTEachers } from "../Services/HomeTeacher.service";

export const useHomeTeachers = () => {
  return useQuery<IHomeTeacher[]>({
    queryKey: ["home-teachers"],
    queryFn: () => ApiHomeTEachers.getAll(),
  });
};

export const useHomeTeacherById = (id: number) => {
  return useQuery<IHomeTeacher>({
    queryKey: ["home-teachers", id],
    queryFn: () => ApiHomeTEachers.getById(id),
    enabled: !!id,
  });
};

export const useHomeTeacherCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IHomeTeacher) => ApiHomeTEachers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-teachers"] });
    },
  });
};

export const useHomeTeacherUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IHomeTeacher> }) =>
      ApiHomeTEachers.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["home-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["home-teachers", id] });
    },
  });
};

export const useHomeTeacherUpdatePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IHomeTeacher> }) =>
      ApiHomeTEachers.updatePassword(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["home-teachers", id] });
    },
  });
};

export const useHomeTeacherDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ApiHomeTEachers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-teachers"] });
    },
  });
};
