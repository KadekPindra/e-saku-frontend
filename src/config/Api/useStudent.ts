import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiStudents } from "../Services/Students.service";
import {
  IStudent,
  IStudentUpdatePassword,
  IStudentUpdateStatus,
} from "../Models/Student";
import { IStudentCreate } from "../Models/StudentCreate";

//fetch all student
export const useStudent = () => {
  return useQuery<IStudent[]>({
    queryKey: ["students"],
    queryFn: () => ApiStudents.getAll(),
  });
};

// Fetch student by id
export const useStudentById = (id: string) => {
  return useQuery<IStudent>({
    queryKey: ["student", id],
    queryFn: () => ApiStudents.getById(id),
    enabled: !!id,
  });
};

// Fetch students by class id
export const useStudentsByClassId = (class_id: number) => {
  return useQuery<IStudent[]>({
    queryKey: ["students", "class", class_id],
    queryFn: () => ApiStudents.getByClassId(class_id),
    enabled: !!class_id,
  });
};

// Create student
export const useStudentCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IStudentCreate) => ApiStudents.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => {
      console.error("Error creating student:", error);
    },
  });
};

// Update Password
export const useStudentUpdatePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<IStudentUpdatePassword>;
    }) => ApiStudents.updatePassword(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["student", id] });
    },
  });
};

// Update Status
export const useStudentUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<IStudentUpdateStatus>;
    }) => ApiStudents.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["student", id] });
    },
  });
};

// Update student
export const useStudentUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IStudent> }) =>
      ApiStudents.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student", id] });
    },
  });
};

// Upload student profile
export const useStudentUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      return ApiStudents.uploadPhoto(id, file);
    },

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["student", id.toString()] });
    },
  });
};

// Delete student profile
export const useStudentDeleteProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ApiStudents.deleteProfileImage(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["student", id] });
    },
  });
};

// Delete student
export const useStudentDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ApiStudents.delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        ["students"],
        (oldData: IStudent[] | undefined) =>
          oldData ? oldData.filter((student) => student.id !== id) : []
      );
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => {
      console.error("Error deleting student:", error);
    },
  });
};

export const useStudentDeleteByClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (class_id: number) => ApiStudents.deleteByClassId(class_id),
    onSuccess: (_, class_id) => {
      queryClient.setQueryData(
        ["students"],
        (oldData: IStudent[] | undefined) =>
          oldData
            ? oldData.filter((student) => student.class_id !== class_id)
            : []
      );
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => {
      console.error("Error deleting student:", error);
    },
  });
};

// Export data Student
export const useStudentExportByClass = () => {
  return async (class_id: number) => {
    try {
      const blob = await ApiStudents.exportByClassId(class_id);

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;

      const fileName = `students_class_${class_id}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
      throw error;
    }
  };
};

// Export data History
export const useStudentHistoryExport = () => {
  return async (month?: number, year?: number) => {
    try {
      const response = await ApiStudents.exportHistory(month, year);

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;

      const fileName = `history_export_${year ?? "all_year"}_${
        month ?? "all_month"
      }_${new Date().toISOString().slice(0, 10)}.pdf`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export history failed:", error);
      throw error;
    }
  };
};

export const useStudentSingleExports = () => {
  return async (student_id: string) => {
    try {
      const response = await ApiStudents.exportSingleStudent(student_id);

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;

      const fileName = `student export_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export history failed:", error);
      throw error;
    }
  };
};
