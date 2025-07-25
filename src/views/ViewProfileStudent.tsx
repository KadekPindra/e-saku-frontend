import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Clock, Edit, Loader2, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useStudentById } from "@/config/Api/useStudent";
import { IStudent } from "@/config/Models/Student";
import { Button } from "@/components/ui/button";
import { useExtracurricularsByStudentId } from "@/config/Api/useExtracurriculars";
import { IExtracurricular } from "@/config/Models/Extracurriculars";

const ViewProfileStudent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState<IStudent | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [lastActive, setLastActive] = useState<string>("N/A");

  // Get student ID from localStorage
  const studentId = localStorage.getItem("student_id") || "";

  // API hooks
  const { data: student, isLoading: studentLoading } =
    useStudentById(studentId);
  const { data: studentExtracurriculars, isLoading: extracurricularsLoading } =
    useExtracurricularsByStudentId(studentId);


  // Fetch student data
  useEffect(() => {
    if (student) {
      setStudentData(student);
      if (student.profile_image) {
        setPhotoUrl(
          `${import.meta.env.VITE_API_URL?.replace("/api", "/public")}${
            student.profile_image
          }`
        );
      }

      const lastActivityRaw = localStorage.getItem("last_activity");
      if (lastActivityRaw) {
        try {
          const date = new Date(lastActivityRaw);
          const formatted = date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          setLastActive(formatted);
        } catch (error) {
          console.error("Error formatting last_activity:", error);
          setLastActive("N/A");
        }
      }
    }

    if (!studentLoading) {
      setIsLoading(false);
    }
  }, [student, studentLoading]);

  const imageSrc = photoUrl
    ? photoUrl
    : student?.profile_image
    ? `${import.meta.env.VITE_API_URL?.replace("/api", "/public")}${
        student.profile_image
      }`
    : "";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-14 h-14 border-4 border-gray-300 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-600 text-lg font-medium">
          Gagal memuat data profil
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 text-black">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-black">
          Biodata Siswa
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,300px)_1fr] gap-4 sm:gap-6 lg:gap-8">
        {/* Left Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Profile Photo Card */}
          <Card className="shadow-sm border border-gray-200 bg-white rounded-lg overflow-hidden">
            <CardHeader className="bg-white py-3 px-4">
              <CardTitle className="text-center text-black">
                Foto Profil
              </CardTitle>
              <div className="relative flex justify-center mt-5">
                <div className="absolute w-64 h-0.5 bg-green-400 rounded-full shadow-sm mt-1"></div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 flex flex-col items-center">
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-gray-200 flex items-center justify-center mb-4 sm:mb-6 border-4 border-green-100 overflow-hidden">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="Student profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-400"
                    strokeWidth={1}
                  />
                )}
              </div>
            </CardContent>

            <div className="p-4 w-full">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profil
              </Button>
            </div>
          </Card>

          {/* Last Activity */}
          <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-3 flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2 text-green-600" />
            Terakhir aktif pada {lastActive}
          </div>
        </div>

        {/* Right Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Personal Information Card */}
          <Card className="shadow-sm border border-gray-200 bg-white rounded-lg overflow-hidden">
            <CardHeader className="bg-white py-3 px-4">
              <CardTitle className="text-black flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informasi Pribadi
              </CardTitle>
              <div className="relative flex justify-center mt-5">
                <div className="absolute w-full h-0.5 bg-green-400 rounded-full shadow-sm mt-1"></div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Nama Lengkap
                  </label>
                  <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                    {studentData.name}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      NIS
                    </label>
                    <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                      {studentData.nis || "Tidak diatur"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      NISN
                    </label>
                    <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                      {studentData.nisn || "Tidak diatur"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Kelas
                    </label>
                    <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                      {student?.classroom?.name || "Tidak diatur"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Email
                    </label>
                    <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                      {studentData.email || "Tidak diatur"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extracurricular List Card */}
          <Card className="shadow-sm border border-gray-200 bg-white rounded-lg overflow-hidden">
            <CardHeader className="bg-white py-3 px-4">
              <CardTitle className="text-black flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Ekstrakurikuler
              </CardTitle>
              <div className="relative flex justify-center mt-5">
                <div className="absolute w-full h-0.5 bg-green-400 rounded-full shadow-sm mt-1"></div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {extracurricularsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                </div>
              ) : studentExtracurriculars &&
                studentExtracurriculars.extracurriculars &&
                studentExtracurriculars.extracurriculars.length > 0 ? (
                <div className="space-y-3">
                  {studentExtracurriculars.extracurriculars.map((ec: IExtracurricular) => (
                    <div
                      key={ec.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="text-base font-medium">{ec.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mb-3 text-gray-300" />
                  <p>Tidak ada ekstrakurikuler yang diikuti</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewProfileStudent;
