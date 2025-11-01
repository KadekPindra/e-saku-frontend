import { ApiRequest } from "./Api.service";
import { IClassroom } from "../Models/Classroom";

export const ApiClassrooms = {
  getAll: (): Promise<IClassroom[]> =>
    ApiRequest({ url: "/classes", method: "GET" }),
  getById: (id: number): Promise<IClassroom> =>
    ApiRequest({ url: `/classes/${id}`, method: "GET" }),
  getByTeacherId: (teacher_id: number): Promise<IClassroom[]> =>
    ApiRequest({ url: `/classes/teacher/${teacher_id}`, method: "GET" }),

  getByHomeroomTeacherId: (
    homeroom_teacher_id: number
  ): Promise<IClassroom[]> =>
    ApiRequest({
      url: `/classes/homeroom-teacher/${homeroom_teacher_id}`,
      method: "GET",
    }),
  getByMajorId: (major_id: number): Promise<IClassroom[]> =>
    ApiRequest({ url: `/classes/major/${major_id}`, method: "GET" }),
  create: (data: Partial<IClassroom>): Promise<IClassroom> =>
    ApiRequest({ url: "/classes", method: "POST", body: data }),
  update: (id: number, data: Partial<IClassroom>): Promise<IClassroom> =>
    ApiRequest({
      url: `/classes/${id}`,
      method: "POST",
      body: { ...data, _method: "PUT" },
    }),
  assignTeacher: (
    teacherId: number,
    classroomIds: number[]
  ): Promise<{ message: string }> =>
    ApiRequest({
      url: `/classes/assign-teacher`,
      method: "POST",
      body: {
        _method: "PUT",
        teacher_id: teacherId,
        classroom_ids: classroomIds,
      },
    }),
  assignHomeroomTeacher: (
    homeRoomTeacherId: number,
    class_id: number[]
  ): Promise<{ message: string }> =>
    ApiRequest({
      url: `/classes/assign-homeroom-teacher`,
      method: "POST",
      body: {
        _method: "PUT",
        homeroom_teacher_id: homeRoomTeacherId,
        class_id: class_id,
      },
    }),
  removeTeacher: (classroomIds: number[]): Promise<{ message: string }> =>
    ApiRequest({
      url: `/classes/remove-teacher`,
      method: "POST",
      body: { _method: "PUT", classroom_ids: classroomIds },
    }),
  removeHomeroomTeacher: (
    class_id: number[]
  ): Promise<{ message: string }> =>
    ApiRequest({
      url: `/classes/remove-homeroom-teacher`,
      method: "POST",
      body: { _method: "PUT", class_id: class_id },
    }),
  delete: (id: number): Promise<{ message: string }> =>
    ApiRequest({
      url: `/classes/${id}`,
      method: "POST",
      body: { _method: "DELETE" },
    }),
};
