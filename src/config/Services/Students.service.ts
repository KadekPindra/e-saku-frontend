import {
  IStudent,
  IStudentUpdatePassword,
  IStudentUpdateStatus,
} from "../Models/Student";
import { CreateStudentResponse, IStudentCreate } from "../Models/StudentCreate";
import { ApiRequest } from "./Api.service";

export const ApiStudents = {
  getAll: (): Promise<IStudent[]> =>
    ApiRequest({ url: "/students", method: "GET" }),
  getById: (id: string): Promise<IStudent> =>
    ApiRequest({ url: `/students/${id}`, method: "GET" }),
  getByClassId: (class_id: number): Promise<IStudent[]> =>
    ApiRequest({ url: `/students/class/${class_id}`, method: "GET" }),

  // New method for getting student profile (for authenticated student)
  getProfile: (): Promise<IStudent> =>
    ApiRequest({ url: "/student/me", method: "GET" }),

  create: (data: IStudentCreate): Promise<CreateStudentResponse> =>
    ApiRequest({ url: "/students", method: "POST", body: data }),
  update: (id: string, data: Partial<IStudent>): Promise<IStudent> =>
    ApiRequest({
      url: `/students/${id}`,
      method: "POST",
      body: { ...data, _method: "PUT" },
    }),
  uploadPhoto: (id: string, file: File): Promise<IStudent> => {
    const formData = new FormData();
    formData.append("profile_image", file);

    return ApiRequest({
      url: `/students/${id}/upload-photo`,
      method: "POST",
      body: formData,
      isFormData: true,
    });
  },
  updatePassword: (
    id: string,
    data: Partial<IStudentUpdatePassword>
  ): Promise<{ message: string }> =>
    ApiRequest({
      url: `/students/${id}/update-password`,
      method: "POST",
      body: { ...data, _method: "PUT" },
    }),

  updateStatus: (
    id: string,
    data: Partial<IStudentUpdateStatus>
  ): Promise<{ message: string }> =>
    ApiRequest({
      url: `/students/${id}/update-status`,
      method: "POST",
      body: { ...data, _method: "PUT" },
    }),
  deleteProfileImage: (id: string): Promise<IStudent> =>
    ApiRequest({
      url: `/students/${id}/photo`,
      method: "POST",
      body: { _method: "DELETE" },
    }),
  delete: (id: number) =>
    ApiRequest({
      url: `/students/${id}`,
      method: "POST",
      body: { _method: "DELETE" },
    }),
  deleteByClassId: (class_id: number) =>
    ApiRequest({
      url: `/students/class/${class_id}`,
      method: "POST",
      body: { _method: "DELETE" },
    }),
  exportByClassId: (class_id: number): Promise<Blob> =>
    ApiRequest({
      url: `/students/export/class/${class_id}`,
      method: "GET",
      responseType: "blob",
    }),
  exportHistory: (month?: number, year?: number): Promise<Blob> =>
    ApiRequest({
      url: `/history/export${
        month && year ? `?month=${month}&year=${year}` : ""
      }`,
      method: "GET",
      responseType: "blob",
    }),
  exportSingleStudent: (student_id: string): Promise<Blob> =>
    ApiRequest({
      url: `/students/export/${student_id}`,
      method: "GET",
      responseType: "blob",
    }),
};
