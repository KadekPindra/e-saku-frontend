import { IStudent } from "./Student";

export interface IAccomplishments {
    id: number;
    student_id: string;
    accomplishment_type: string;
    description: string;
    accomplishment_date: string;
    violation_date: string;
    level: number;
    rank: string
    image_documentation: string | null;
    points: number;
    created_at: string;
    updated_at: string;
    student: IStudent;
}