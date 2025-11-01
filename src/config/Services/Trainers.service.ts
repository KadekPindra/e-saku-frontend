import { ITrainer } from "../Models/Trainer";
import { ApiRequest } from "./Api.service";

export const ApiTrainer = {
  getAll: (): Promise<ITrainer[]> =>
    ApiRequest({ url: "/trainer", method: "GET" }),
  getById: (id: number): Promise<ITrainer> =>
    ApiRequest({ url: `/trainer/${id}`, method: "GET" }),
  create: (data: Partial<ITrainer>): Promise<ITrainer> =>
    ApiRequest({ url: "/trainers", method: "POST", body: data }),
  update: (id: number, data: Partial<ITrainer>): Promise<ITrainer> =>
    ApiRequest({
      url: `/trainer/${id}`,
      method: "POST",
      body: { ...data, _method: "PUT" },
    }),
  updatePassword: (
    id: number,
    data: Partial<ITrainer>
  ): Promise<{ message: string }> =>
    ApiRequest({
      url: `/trainer/${id}/update-password`,
      method: "POST",
      body: { ...data, _method: "PUT" },
    }),
  delete: (id: number): Promise<{ message: string }> =>
    ApiRequest({
      url: `/trainer/${id}`,
      method: "POST",
      body: { _method: "DELETE" },
    }),
};
