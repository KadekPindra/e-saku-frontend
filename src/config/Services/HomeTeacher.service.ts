import { IHomeTeacher } from "../Models/HomeTeachers";
import { ApiRequest } from "./Api.service";

export const ApiHomeTEachers = {
  getAll: (): Promise<IHomeTeacher[]> =>
    ApiRequest({ url: "/home-room-teachers", method: "GET" }),
  getById: (id: number): Promise<IHomeTeacher> =>
    ApiRequest({ url: `/home-room-teachers/${id}`, method: "GET" }),
  create: (data: IHomeTeacher): Promise<IHomeTeacher> =>
    ApiRequest({ url: "/home-room-teachers", method: "POST", body: data }),
  update: (id: number, data: Partial<IHomeTeacher>): Promise<IHomeTeacher> =>
    ApiRequest({
      url: `/home-room-teachers/${id}`,
      method: "POST",
      body: { ...data, _method: "PUT" },
    }),
  updatePassword: (id: number, data: Partial<IHomeTeacher>): Promise<IHomeTeacher> =>
    ApiRequest({
      url: `/home-room-teachers/${id}/update-password`,
      method: "POST",    
      body: { ...data, _method: "PUT" },
    }),
  delete: (id: number): Promise<{ message: string }> =>
    ApiRequest({
      url: `/home-room-teachers/${id}`,
      method: "POST",
      body: { _method: "DELETE" },
    }),
};
