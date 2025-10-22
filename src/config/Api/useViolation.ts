import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IViolation } from "../Models/Violation";
import { ApiViolations } from "../Services/Violations.service";

// Fetch all violations
export const useViolations = () => {
  return useQuery<IViolation[]>({
    queryKey: ["violations"],
    queryFn: () => ApiViolations.getAll(),
  });
};

// Fetch violation by ID
export const useViolationById = (id: number) => {
  return useQuery<IViolation>({
    queryKey: ["violation", id],
    queryFn: () => ApiViolations.getById(id),
    enabled: !!id,
  });
};

// Fetch violations by teacher ID
export const useViolationsByTeacherId = (teacher_id: string) => {
  return useQuery<IViolation[]>({
    queryKey: ["violations", "teacher", teacher_id],
    queryFn: () => ApiViolations.getByTeacherId(teacher_id),
    enabled: !!teacher_id,
  });
};

// Fecth violation by student ID
export const useViolationsByStudentId = (student_id: string) => {
  return useQuery<IViolation[]>({
    queryKey: ["violationsByStudent", student_id],
    queryFn: () => {
      if (!student_id) {
        return Promise.resolve([]); 
      }
      return ApiViolations.getByStudentId(student_id).catch((error) => {

        console.error("Error fetching violations:", error);
        return [];
      });
    },
    enabled: !!student_id, 
  });
};

// Create violation
export const useViolationCreate = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; data: IViolation[] },
    Error,
    Partial<IViolation>                   
  >({
    mutationFn: (data) => ApiViolations.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["violations"] });
    },
    onError: (error) => {
      console.error("Error creating violation:", error);
    },
  });
};

// Upload Documentation
export const useViolationsDocumentationUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      ApiViolations.uploadDocumentation(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["violation", id] });
    },
  })
}

// Delete Documentation
export const useViolationsDocumentationDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ApiViolations.deleteDocumentation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["violation", id] });
    },
  })
}

// Update violation
export const useViolationUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IViolation> }) =>
      ApiViolations.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["violations"] });
      queryClient.invalidateQueries({ queryKey: ["violation", id] });
    },
    onError: (error) => {
      console.error("Error updating violation:", error);
    },
  });
};

// Delete violation
export const useViolationDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ApiViolations.delete(id),
    onSuccess: () => {
      // Invalidate semua query yang terkait violations
      queryClient.invalidateQueries({ queryKey: ["violationsByTeacher"] });
      queryClient.invalidateQueries({ queryKey: ["violationsByStudent"] });
      queryClient.invalidateQueries({ queryKey: ["studentViolations"] });
    },
    onError: (error) => {
      console.error("Error deleting violation:", error);
    },
  });
};