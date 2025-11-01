import { IHomeTeacher } from "./HomeTeachers";
import { IMajor } from "./Major";
import { IStudent } from "./Student";
import { ITeacher } from "./Teacher";

export interface IClassroom {
  display_name: string;
  id: number;
  name: string;
  grade: IGrade;
  grade_id: number;
  teacher_id: number;
  homeroom_teacher_id: number;
  total_student: number;
  major_id: number;
  teacher?: ITeacher;
  homeroom_teacher?: IHomeTeacher;
  students?: IStudent[];
  major?: IMajor;
  created_at: string;
  updated_at: string;
}

export interface IGrade{
  id: number;
  name: string;
} 


export interface IAssignClass {
  id: IClassroom['id'];
  display_name: IClassroom['display_name'];
  teacher_id: ITeacher['id'];
}