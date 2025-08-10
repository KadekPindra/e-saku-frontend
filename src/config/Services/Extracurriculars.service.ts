import {
  IChooseExtracurricular,
  IExtracurricular,
  IExtracurricularHistory,
} from "../Models/Extracurriculars";
import { ApiRequest } from "./Api.service";

export const ApiExtracurriculars = {
  getAll: (): Promise<IExtracurricular[]> =>
    ApiRequest({ url: "/extracurriculars", method: "GET" }),
  getAllHistory: (): Promise<IExtracurricularHistory[]> =>
    ApiRequest({ url: "/extracurriculars-history", method: "GET" }),
  getHistoryByTrainer: (): Promise<IExtracurricularHistory[]> =>
    ApiRequest({
      url: "/extracurricular/histories/by-trainer",
      method: "GET",
    }),
  updateStatusHistory: (
    history_id: number
  ): Promise<IExtracurricularHistory[]> =>
    ApiRequest({
      url: `/extracurricular-history/${history_id}/status`,
      method: "GET",
    }),
  getById: (id: number): Promise<IExtracurricular> =>
    ApiRequest({ url: `/extracurriculars/${id}`, method: "GET" }),
  getByStudentId: (student_id: string): Promise<IExtracurricular[]> =>
    ApiRequest({
      url: `/extracurriculars/student/${student_id}`,
      method: "GET",
    }),
  assignForMe: (
    data: IChooseExtracurricular
  ): Promise<IChooseExtracurricular[]> => {
    const payload = {
      extracurricular_ids: data.extracurricular_ids,
    };

    return ApiRequest({
      url: "/me/extracurriculars",
      method: "POST",
      body: payload,
    });
  },
  deleteForMe: (): Promise<IChooseExtracurricular[]> => {
    return ApiRequest({
      url: "/me/extracurriculars",
      method: "POST",
      body: { _method: "DELETE" },
    });
  },
  create: (data: Partial<IExtracurricular>): Promise<IExtracurricular> =>
    ApiRequest({ url: "/extracurriculars", method: "POST", body: data }),
  update: (
    id: number,
    data: Partial<IExtracurricular>
  ): Promise<IExtracurricular> =>
    ApiRequest({
      url: `/extracurriculars/${id}`,
      method: "POST",
      body: { ...data, _method: "PUT" },
    }),
  delete: (id: number): Promise<{ message: string }> =>
    ApiRequest({
      url: `/extracurriculars/${id}`,
      method: "POST",
      body: { _method: "DELETE" },
    }),
  exportSingleExtracurricular: (id: number): Promise<Blob> =>
    ApiRequest({
      url: `/extracurriculars/export/${id}`,
      method: "GET",
      responseType: "blob",
    }),
  exportAllExtracurricular: (): Promise<Blob> =>
    ApiRequest({
      url: `/extracurricularsAll/export`,
      method: "GET",
      responseType: "blob",
    }),
};
