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

export const useClassroomByHomeroomTeacherId = () => {
  const homeroom_teacher_id = parseInt(
    localStorage.getItem("homeroom_teacher_id") || "0",
    10
  );

  return useQuery({
    queryKey: ["homeroomTeacherClasses", homeroom_teacher_id],
    queryFn: async () => {
      if (!homeroom_teacher_id) return [];
      return ApiClassrooms.getByHomeroomTeacherId(homeroom_teacher_id);
    },
    enabled: !!homeroom_teacher_id,
    select: (data) => data || [],
  });
};

export const useClassroomByAssignTeacherId = (teacherId: number) => {
  return useQuery({
    queryKey: ["teacherClasses", teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      return ApiClassrooms.getByTeacherId(teacherId);
    },
    enabled: !!teacherId,
    select: (data) => data || [],
  });
};

export const useClassroomByAssignHomeroomTeacherId = (homeRoomTeacherId: number) => {
  return useQuery({
    queryKey: ["homeroomTeacherClasses", homeRoomTeacherId],
    queryFn: async () => {
      if (!homeRoomTeacherId) return [];
      return ApiClassrooms.getByHomeroomTeacherId(homeRoomTeacherId);
    },
    enabled: !!homeRoomTeacherId,
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
      queryClient.invalidateQueries({
        queryKey: ["teacherClasses", teacher_id],
      });
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
        queryKey: ["classes", variables.id],
      });
    },
  });
};

export const useAssignTeacherToClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      classroomIds,
      teacherId,
    }: {
      classroomIds: number[];
      teacherId: number;
    }) => ApiClassrooms.assignTeacher(teacherId, classroomIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};

export const useAssignHomeroomTeacherToClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      classroomIds,
      homeRoomTeacherId,
    }: {
      classroomIds: number[];
      homeRoomTeacherId: number;
    }) => ApiClassrooms.assignHomeroomTeacher(homeRoomTeacherId, classroomIds),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};

export const useRemoveTeacherFromClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classroomIds: number[]) =>
      ApiClassrooms.removeTeacher(classroomIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};

export const useRemoveHomeroomTeacherFromClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classroomIds: number[]) =>
      ApiClassrooms.removeHomeroomTeacher(classroomIds),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
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
        queryKey: ["teacherClasses", teacher_id],
      });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
};
