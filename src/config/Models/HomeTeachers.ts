export interface IHomeTeacher {
  id: number;
  nip: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  profile_image: string;
  password?: string;
  password_confirmation?: string;
}