import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IClassroom } from "../Models/Classroom";
import { ApiClassrooms } from "../Services/Classrooms.service";

//fetch all classroom
export const useClassroom = () => {
  return useQuery<IClassroom[]>({
    queryKey: ["classes"],
    queryFn: () => ApiClassrooms.getAll(),
  });
};

//fetch classroom by id
export const useClassroomById = (id: number) => {
  return useQuery<IClassroom>({
    queryKey: ["classes", id],
    queryFn: () => ApiClassrooms.getById(id),
    enabled: !!id,
  });
};

export const useClassroomByTeacherId = () => {
  const teacher_id = parseInt(localStorage.getItem("teacher_id") || "0", 10);

  return useQuery({
    queryKey: ["teacherClasses", teacher_id],
    queryFn: async () => {
      if (!teacher_id) return [];
      return ApiClassrooms.getByTeacherId(teacher_id);
    },
    enabled: !!teacher_id, 
    select: (data) => data || [],
  });
};

//create classroom
export const useClassroomCreate = () => {
   const teacher_id = parseInt(localStorage.getItem("teacher_id") || "0", 10);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ApiClassrooms.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherClasses", teacher_id] });
    },
  });
};

//update classroom
export const useClassroomUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IClassroom> }) =>
      ApiClassrooms.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teacherClasses"] });
      queryClient.invalidateQueries({ 
        queryKey: ["classes", variables.id] 
      });
    },
  });
};

//delete classroom
export const useClassroomDelete = () => {
  const queryClient = useQueryClient();
  const teacher_id = parseInt(localStorage.getItem("teacher_id") || "0", 10);

  return useMutation({
    mutationFn: (id: number) => ApiClassrooms.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["teacherClasses", teacher_id] 
      });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
};
