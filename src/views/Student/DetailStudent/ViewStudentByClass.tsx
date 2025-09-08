import {
  Search,
  SquarePen,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  FileSpreadsheet,
  X,
  Check,
  Trash,
  ArrowLeft,
  Plus,
  UploadIcon,
  MoveLeft, // Add ArrowLeft icon for back button
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Add useNavigate
import {
  useStudentCreate,
  useStudentDeleteByClass,
  useStudentExportByClass,
  useStudentsByClassId,
} from "@/config/Api/useStudent";
import { useClassroom, useClassroomById } from "@/config/Api/useClasroom";
import { useStudentDelete } from "@/config/Api/useStudent";
import { useTeacherById } from "@/config/Api/useTeacher";
import { StudentImportService } from "@/config/Services/StudentImport.service";
import { IStudent } from "@/config/Models/Student";
import ConfirmationModal from "@/components/ui/confirmation";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { IStudentCreate } from "@/config/Models/StudentCreate";
import clsx from "clsx";

interface ClassHeaderProps {
  className: string;
  teacherName: string;
  showBackButton?: boolean; // Add showBackButton prop
}

const ClassHeader: React.FC<ClassHeaderProps> = ({
  className,
  teacherName,
  showBackButton,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="px-6 py-5">
        {showBackButton && (
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-3 text-gray-600 hover:text-green-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Kelas
          </Button>
        )}

        <h1 className="text-3xl font-bold text-green-500">{className}</h1>

        <div className="mt-1 flex items-center">
          <span className="text-gray-600">Diampu oleh:</span>
          <span className="ml-2 font-semibold text-gray-700">
            {teacherName}
          </span>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-green-400 to-green-500"></div>
    </div>
  );
};

const LoadingSpinner: React.FC = () => {
  return (
    <div className="p-6 flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

const ViewStudentByClass: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const classId = parseInt(id || "0");
  const [userType, setUserType] = useState<"teacher" | "student">("teacher");
  const [searchText, setSearchText] = useState<string>("");
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteAllOpen, setIsModalDeleteAllOpen] = useState(false);
  const [isModalExportOpen, setIsModalExportOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const [studentByClasstoDelete, setStudentByClasstoDelete] = useState<
    number | null
  >(null);
  const [displayedStudents, setDisplayedStudents] = useState<IStudent[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef<number>(0);

  const { data: classroom, isLoading: classLoading } =
    useClassroomById(classId);
  const { data: students, isLoading: studentsLoading } =
    useStudentsByClassId(classId);
  const exportStudents = useStudentExportByClass();
  const createStudent = useStudentCreate();

  const teacherId = classroom?.teacher_id ?? 0;
  const { data: teacher } = useTeacherById(teacherId);
  const deleteStudent = useStudentDelete();
  const deleteStudentByClass = useStudentDeleteByClass();
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const { data: classes } = useClassroom();
  const navigate = useNavigate();

  useEffect(() => {
    const type = localStorage.getItem("user_type");
    if (type === "student") {
      setUserType("student");
    } else {
      setUserType("teacher");
    }
  }, []);

  const statusTranslations: Record<string, string> = {
    active: "Aktif",
    rest: "Istirahat",
    transfered: "Dipindahkan",
    resign: "Mengundurkan Diri",
  };

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      const newTimeout = setTimeout(() => {
        setSearchText(value);
        setCurrentPage(1);
      }, 300);

      setSearchTimeout(newTimeout);
    },
    [searchTimeout]
  );

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const filteredStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) return [] as IStudent[];

    let result = [...students];

    result.sort((a, b) => {
      const nisA = a.nis?.toLowerCase() ?? "";
      const nisB = b.nis?.toLowerCase() ?? "";
      return nisA.localeCompare(nisB);
    });

    // Apply search filter if search text exists
    if (searchText !== "") {
      result = result.filter(
        (student: IStudent) =>
          student.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          student.nis?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return result;
  }, [searchText, students]);

  useEffect(() => {
    if (filteredStudents && filteredStudents.length >= 0) {
      const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);

      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      } else if (currentPage < 1) {
        setCurrentPage(1);
      }

      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      setDisplayedStudents(filteredStudents.slice(startIndex, endIndex));
    } else {
      setDisplayedStudents([]);
    }
  }, [filteredStudents, currentPage, rowsPerPage]);

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleDeleteStudent = (id: number) => {
    setStudentToDelete(id);
    setIsModalOpen(true);
  };

  const handleDeleteStudentByClass = (class_id: number) => {
    setStudentByClasstoDelete(class_id);
    setIsModalDeleteAllOpen(true);
  };

  const [newStudent, setNewStudent] = useState<IStudentCreate>({
    name: "",
    nis: "",
    nisn: "",
    email: "",
    class_id: classId,
    place_of_birth: "",
    birth_date: "",
    religion: "",
    height: "",
    weight: "",
    gender: "",
    phone_number: "",
    address: null,
    sub_district: null,
    district: null,
    father_name: null,
    father_job: null,
    mother_name: null,
    mother_job: null,
    guardian_name: null,
    guardian_job: null,
    profile_image: null,
  });

  const [submitStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );

  const handleInputChange = (field: string, value: string | number) => {
    setNewStudent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirmDelete = async () => {
    const loadingId = toast.loading("Menghapus...");

    if (studentToDelete) {
      try {
        setIsModalOpen(false);
        await deleteStudent.mutateAsync(studentToDelete);
        setStudentToDelete(null);
      } catch (error) {
        toast.error("Data siswa gagal dihapus");
      } finally {
        toast.success("Data siswa berhasil dihapus");
        toast.dismiss(loadingId);
      }
    }
  };

  const handleConfirmExportData = async () => {
    try {
      await exportStudents(classId);
      setIsModalExportOpen(false);
      toast.success("File berhasil diunduh");
    } catch (error) {
      console.error("Ekspor gagal:", error);
      toast.error("Gagal ekspor file");
    }
  };

  const handleConfirmDeleteByClass = async () => {
    if (studentByClasstoDelete) {
      try {
        await deleteStudentByClass.mutateAsync(studentByClasstoDelete);
        toast.success("Seluruh data siswa berhasil dihapus");
        setIsModalDeleteAllOpen(false);
        setStudentByClasstoDelete(null);
      } catch (error) {
        toast.error("Data siswa gagal dihapus");
      }
    }
  };

  const validateAndSetFile = (file: File) => {
    const validation = StudentImportService.validateFile(file);

    if (!validation.isValid) {
      setUploadError(validation.error || "File tidak valid");
      setSelectedFile(null);
      return false;
    }

    setSelectedFile(file);
    setUploadError("");
    setUploadStatus("idle");
    setUploadProgress(0);
    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (files.length > 1) {
        setUploadError("Hanya satu file yang diperbolehkan");
        return;
      }
      const file = files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !token) return;

    setUploadStatus("uploading");
    setUploadProgress(0);

    const result = await StudentImportService.importStudents(
      selectedFile,
      classId,
      setUploadProgress
    );

    if (result.success) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUploadProgress(100);
      toast.success(result.message);
      setUploadStatus("success");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    } else {
      setUploadStatus("error");
      toast.error("Data siswa gagal diimpor");
      setUploadError(result.message);
    }
  };

  const handleFileExport = () => {
    setIsModalExportOpen(true);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadError("");
    setUploadStatus("idle");
    setUploadProgress(0);
    setIsDragging(false);
    dragCounter.current = 0;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setUploadStatus("idle");
    setUploadError("");
    setUploadProgress(0);
    setIsDragging(false);
    dragCounter.current = 0;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const templateUrl = "/api/download/student-import-template.xlsx";
    const link = document.createElement("a");
    link.href = templateUrl;
    link.download = "student_import_template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (classLoading || studentsLoading) {
    return <LoadingSpinner />;
  }

  if (!classroom) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-gray-500">Kelas tidak ditemukan</p>
      </div>
    );
  }

  const teacherName = teacher?.name || "Nama guru tidak tersedia";
  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / rowsPerPage)
  );
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  function handleSubmitStudent(
    event: React.MouseEvent<HTMLButtonElement>
  ): void {
    event.preventDefault();

    const loadingId = toast.loading("Menambahkan siswa...");
    setIsAddStudentModalOpen(false);

    createStudent.mutate(newStudent, {
      onSuccess: (data) => {
        toast.dismiss(loadingId);
        toast.success("Siswa berhasil ditambahkan");
        navigate(`/studentbio/${data.student.id}`);
      },
      onError: (error: any) => {
        toast.dismiss(loadingId);
        toast.error("Gagal menambahkan siswa.");
        setSubmitError(error?.response?.data?.message);
      },
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(`/student`)}
        className="group flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors cursor-pointer"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 group-hover:border-green-500 group-hover:bg-green-50 transition-all">
          <MoveLeft className="h-4 w-4" />
        </div>
        <span className="font-medium text-sm md:text-base">
          Kembali ke Kelas
        </span>
      </Button>
      <ClassHeader
        className={classroom?.display_name || ""}
        teacherName={teacherName}
        showBackButton={userType === "student"}
      />

      <div className="flex flex-col md:flex-row justify-between gap-4 ">
        <Dialog
          open={isAddStudentModalOpen}
          onOpenChange={setIsAddStudentModalOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="hover:bg-[#009616] hover:text-white transition-all duration-300 w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Siswa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[500px] p-3 sm:p-4 md:p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg md:text-xl">
                Tambah Siswa Baru
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm md:text-base">
                Buat siswa baru dengan mengisi informasi di bawah ini
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="studentName"
                    className="text-xs sm:text-sm md:text-base font-medium text-gray-900"
                  >
                    Nama Siswa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="studentName"
                    placeholder="Masukkan nama siswa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 text-xs sm:text-sm md:text-base"
                    value={newStudent.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={submitStatus === "submitting"}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="studentNis"
                    className="text-xs sm:text-sm md:text-base font-medium text-gray-900"
                  >
                    NIS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="studentNis"
                    placeholder="Masukkan NIS"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 text-xs sm:text-sm md:text-base"
                    value={newStudent.nis}
                    onChange={(e) => handleInputChange("nis", e.target.value)}
                    disabled={submitStatus === "submitting"}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="studentNisn"
                    className="text-xs sm:text-sm md:text-base font-medium text-gray-900"
                  >
                    NISN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="studentNisn"
                    placeholder="Masukkan NISN"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 text-xs sm:text-sm md:text-base"
                    value={newStudent.nisn}
                    onChange={(e) => handleInputChange("nisn", e.target.value)}
                    disabled={submitStatus === "submitting"}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="studentClass"
                    className="text-xs sm:text-sm md:text-base font-medium text-gray-900"
                  >
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="studentClass"
                    value={classroom?.display_name || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 text-xs sm:text-sm md:text-base"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="teacherSelect"
                    className="text-xs sm:text-sm md:text-base font-medium text-gray-500"
                  >
                    Guru Pengampu(Otomatis)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={
                        classes?.find((c) => c.id === newStudent.class_id)
                          ?.teacher?.name || "Pilih kelas terlebih dahulu"
                      }
                      disabled
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed text-xs sm:text-sm md:text-base"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Kelas akan ditugaskan ke guru saat ini secara otomatis
                  </p>
                </div>

                {submitError && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-red-600">
                        <X className="w-4 h-4 flex-shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {submitStatus === "success" && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-green-600">
                        <div className="w-4 h-4 flex-shrink-0">✓</div>
                        <span>Siswa berhasil ditambahkan!</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {submitStatus === "submitting" && (
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-1000 animate-pulse w-3/4"></div>
                  </div>
                )}
              </div>

              {/* Guidelines Card - Made Responsive */}
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-3 sm:p-4">
                  <h4 className="text-xs sm:text-sm md:text-base font-medium mb-2">
                    Panduan Pengisian Data Siswa:
                  </h4>
                  <ul className="space-y-1 text-xs sm:text-sm">
                    <li className="flex items-start">
                      <span className="mr-1">•</span>
                      <span>
                        Nama siswa harus diisi lengkap sesuai KTP atau Akta
                        Kelahiran
                        <p className="font-medium">
                          (contoh: Ahmad Rizki Maulana)
                        </p>
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1">•</span>
                      <span>NIS dan NISN harus unik untuk tiap siswa</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1">•</span>
                      <span>Guru akan otomatis ditugaskan sesuai kelas</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1">•</span>
                      <span>
                        Pemilihan kelas menentukan jurusan dan guru siswa
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  disabled={submitStatus === "submitting"}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSubmitStudent}
                  disabled={submitStatus === "submitting"}
                  className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto text-xs sm:text-sm"
                >
                  {submitStatus === "submitting" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menambahkan Siswa...
                    </>
                  ) : submitStatus === "success" ? (
                    <>
                      <div className="w-4 h-4 mr-2">✓</div>
                      Siswa berhasil ditambahkan!
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Siswa
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Left buttons group with better spacing */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Import Excel Button */}
          <Button
            onClick={handleFileExport}
            variant="outline"
            className="text-green-600 hover:text-white hover:bg-green-600 border border-green-500 transition-all duration-300 w-full sm:w-auto"
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            Ekspor ke Excel
          </Button>

          <Dialog
            open={isImportModalOpen}
            onOpenChange={(open) => {
              setIsImportModalOpen(open);
              if (!open) {
                resetUploadState();
              } else {
                resetUploadState();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="hover:bg-[#009616] hover:text-white transition-all duration-300 w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Impor dari Excel</span>
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-[95vw] sm:max-w-[500px] lg:max-w-[600px] p-3 sm:p-4 lg:p-6 max-h-[90vh] overflow-y-auto"
              onDragOver={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg lg:text-xl leading-tight">
                  Impor data siswa untuk {classroom?.display_name}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm leading-relaxed">
                  Unggah file Excel (.xls atau .xlsx) yang berisi data siswa
                  untuk kelas ini
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
                {uploadStatus === "success" ? (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4 mb-3 sm:mb-4">
                    <div className="text-green-600 flex items-start sm:items-center space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-lg font-semibold">
                          Unggah Berhasil!
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 break-words">
                          Data siswa berhasil diunggah ke kelas{" "}
                          {classroom?.name}.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 sm:space-y-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="excel-upload"
                      />

                      {!selectedFile ? (
                        <div
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          className={`relative transition-all duration-200 ${
                            isDragging ? "scale-100" : ""
                          }`}
                        >
                          <label
                            htmlFor="excel-upload"
                            className={`flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                              isDragging
                                ? "border-green-500 bg-green-50"
                                : "border-gray-300 bg-gray-50 hover:border-green-500 hover:bg-gray-100"
                            }`}
                          >
                            <Upload
                              className={`w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 transition-all duration-200 ${
                                isDragging
                                  ? "text-green-600 scale-100"
                                  : "text-gray-400"
                              }`}
                            />
                            <span
                              className={`text-xs sm:text-sm text-center px-2 transition-colors duration-200 ${
                                isDragging
                                  ? "text-green-600 font-medium"
                                  : "text-gray-600"
                              }`}
                            >
                              {isDragging
                                ? "Lepaskan file di sini untuk mengunggah"
                                : "Klik atau seret file Excel di sini untuk mengunggah"}
                            </span>
                            <span className="text-xs text-gray-400 mt-0.5 sm:mt-1 px-2 text-center">
                              .xls or .xlsx (maks 10MB)
                            </span>
                          </label>
                          {isDragging && (
                            <div className="absolute inset-0 rounded-lg bg-green-500 bg-opacity-10 pointer-events-none animate-pulse" />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between rounded-lg border border-green-200 p-3 sm:p-4 bg-green-50 mb-3 sm:mb-4">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                            <FileSpreadsheet className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                            <div className="truncate min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                {selectedFile.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleRemoveFile}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-2 flex-shrink-0"
                            disabled={uploadStatus === "uploading"}
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      )}

                      {uploadError && (
                        <div className="flex items-start space-x-2 text-xs sm:text-sm text-red-600 bg-red-50 p-2 sm:p-3 rounded-lg border border-red-200">
                          <X className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
                          <span className="break-words">{uploadError}</span>
                        </div>
                      )}

                      {uploadStatus === "uploading" && (
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4 mb-3 sm:mb-4">
                      <h4 className="text-xs sm:text-sm font-medium mb-2">
                        Persyaratan File:
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li className="flex items-start">
                          <span className="mr-1 flex-shrink-0">•</span>
                          <span>Format Excel (.xls atau .xlsx)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-1 flex-shrink-0">•</span>
                          <span>Kolom wajib: Nama, NIS, Email</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-1 flex-shrink-0">•</span>
                          <span>Ukuran file maksimal: 10MB</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-1 flex-shrink-0">•</span>
                          <span>NIS siswa tidak boleh duplikat</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-1 flex-shrink-0">•</span>
                          <span className="break-words">
                            Siswa akan ditambahkan ke kelas {classroom?.name}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {uploadStatus !== "success" && (
                    <Button
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 order-3 sm:order-1"
                      onClick={downloadTemplate}
                      disabled={uploadStatus === "uploading"}
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Unduh Templete
                    </Button>
                  )}

                  <div className="flex gap-2 order-1 sm:order-2">
                    {uploadStatus === "success" ? (
                      <Button
                        onClick={() => setIsImportModalOpen(false)}
                        className="bg-green-500 hover:bg-green-600 text-white flex-1 sm:flex-none"
                      >
                        Lanjutkan
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setIsImportModalOpen(false)}
                          disabled={uploadStatus === "uploading"}
                          className="flex-1 sm:flex-none"
                        >
                          Batal
                        </Button>
                        <Button
                          onClick={handleFileUpload}
                          disabled={
                            !selectedFile || uploadStatus === "uploading"
                          }
                          className="bg-green-500 hover:bg-green-600 text-white flex-1 sm:flex-none"
                        >
                          {uploadStatus === "uploading" ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              <span className="hidden sm:inline">
                                Mengunggah... {uploadProgress}%
                              </span>
                              <span className="sm:hidden">
                                {uploadProgress}%
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Unggah File
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            className="hover:bg-red-700 hover:text-white bg-red-600 transition-all duration-300 w-full sm:w-auto"
            onClick={() => handleDeleteStudentByClass(classId)}
          >
            <Trash className="mr-1 h-4 w-4 flex-shrink-0" />
            <span className="truncate">Hapus Data Siswa</span>
          </Button>
        </div>
      </div>

      <Card className="rounded-xl overflow-hidden shadow-sm border-gray-200">
        <div className="px-6 pt-4 pb-4 border-b-2 border-green-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <CardTitle className="text-xl font-bold text-gray-900">
              Daftar Siswa Kelas {classroom?.name}
            </CardTitle>

            {/* Conditionally render buttons based on user type */}
            {userType === "teacher" && (
              <div className="flex flex-col xl:flex-row items-stretch sm:items-center gap-3 md:pl-4 lg:pl-0">
                <div className="relative flex w-full">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    defaultValue={searchText}
                    onChange={handleSearchChange}
                    placeholder="Cari nama siswa atau NIS..."
                    className="pl-9 bg-white border-gray-200 w-full rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* For students, show only search input */}
            {userType === "student" && (
              <div className="relative flex w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  defaultValue={searchText}
                  onChange={handleSearchChange}
                  placeholder="Cari nama siswa atau NIS..."
                  className="pl-9 bg-white border-gray-200 w-full rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto pt-3">
          {/* Desktop Table - Hidden on mobile */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-12 text-center px-6 font-medium text-black">
                    No
                  </TableHead>
                  <TableHead className="text-center font-medium text-black">
                    NIS
                  </TableHead>
                  <TableHead className="text-left font-medium text-black">
                    Nama
                  </TableHead>
                  <TableHead className="text-center font-medium text-black">
                    Poin Pelanggaran
                  </TableHead>
                  <TableHead className="text-center font-medium text-black">
                    Poin Prestasi
                  </TableHead>
                  <TableHead className="text-center font-medium text-black">
                    Total Poin
                  </TableHead>

                  <TableHead className="text-center font-medium text-black">
                    Status
                  </TableHead>

                  {/* Conditionally render action column for teachers */}
                  {userType === "teacher" && (
                    <TableHead className="text-center font-medium text-black">
                      Aksi
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedStudents && displayedStudents.length > 0 ? (
                  displayedStudents.map((student, index) => {
                    const actualIndex =
                      (safePage - 1) * rowsPerPage + index + 1;
                    return (
                      <TableRow
                        key={student.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <TableCell className="text-center px-6 font-normal">
                          {actualIndex}
                        </TableCell>
                        <TableCell className="text-center font-normal">
                          {student.nis || "N/A"}
                        </TableCell>
                        <TableCell className="text-left font-normal">
                          {/* Conditionally render name as plain text or link */}
                          {userType === "teacher" ? (
                            <Link
                              to={`/studentbio/${student.id}`}
                              className="hover:text-green-500 transition-colors"
                            >
                              {student.name || "Nama tidak tersedia"}
                            </Link>
                          ) : (
                            <span>{student.name || "Nama tidak tersedia"}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-normal">
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-600 border-red-200"
                          >
                            {student.violations_sum_points || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-normal">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-600 border-green-200"
                          >
                            {student.accomplishments_sum_points || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-normal">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-600 border-blue-200"
                          >
                            {student.point_total || 0}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center font-normal">
                          <Badge
                            variant="outline"
                            className={clsx(
                              "border text-xs px-3 py-1 font-medium",
                              {
                                "bg-green-50 text-green-600 border-green-200":
                                  student.status === "active",
                                "bg-blue-50 text-blue-600 border-blue-200":
                                  student.status === "rest",
                                "bg-yellow-50 text-yellow-600 border-yellow-200":
                                  student.status === "transfered",
                                "bg-red-50 text-red-600 border-red-200":
                                  student.status === "resign",
                              }
                            )}
                          >
                            {statusTranslations[student.status] ||
                              student.status}
                          </Badge>
                        </TableCell>

                        {/* Conditionally render action buttons for teachers */}
                        {userType === "teacher" && (
                          <TableCell className="text-center font-normal">
                            <div className="flex justify-center gap-3 items-center">
                              <Link
                                to={`/studentbio/${student.id}?edit=1`}
                                className="text-blue-500 hover:text-blue-600 transition-colors"
                              >
                                <SquarePen className="h-4 w-4" />
                              </Link>
                              <button
                                className="text-red-500 hover:text-red-600 transition-colors"
                                onClick={() => handleDeleteStudent(student.id)}
                                disabled={deleteStudent.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={userType === "teacher" ? 7 : 6}
                      className="text-center py-8 text-gray-500"
                    >
                      {searchText
                        ? "Tidak ada data siswa yang sesuai dengan pencarian"
                        : "Tidak ada data siswa"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-4 px-4">
            {displayedStudents && displayedStudents.length > 0 ? (
              displayedStudents.map((student, index) => {
                const actualIndex = (safePage - 1) * rowsPerPage + index + 1;
                return (
                  <div
                    key={student.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            #{actualIndex}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {student.nis || "N/A"}
                          </span>
                        </div>
                        {/* Conditionally render name as plain text or link */}
                        {userType === "teacher" ? (
                          <Link
                            to={`/studentbio/${student.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-green-500 transition-colors block"
                          >
                            {student.name || "Nama tidak tersedia"}
                          </Link>
                        ) : (
                          <span className="text-lg font-semibold text-gray-900 block">
                            {student.name || "Nama tidak tersedia"}
                          </span>
                        )}
                      </div>

                      {/* Conditionally render action buttons for teachers */}
                      {userType === "teacher" && (
                        <div className="flex gap-2">
                          <Link
                            to={`/studentbio/edit/${student.id}`}
                            className="text-blue-500 hover:text-blue-600 transition-colors p-2"
                          >
                            <SquarePen className="h-4 w-4" />
                          </Link>
                          <button
                            className="text-red-500 hover:text-red-600 transition-colors p-2"
                            onClick={() => handleDeleteStudent(student.id)}
                            disabled={deleteStudent.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          Pelanggaran
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-600 border-red-200 text-xs"
                        >
                          {student.violations_sum_points || 0}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          Prestasi
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-600 border-green-200 text-xs"
                        >
                          {student.accomplishments_sum_points || 0}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Total</div>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-600 border-blue-200 text-xs"
                        >
                          {student.point_total || 0}
                        </Badge>
                      </div>
                      <div className="text-center flex items-end justify-center">
                        <Badge
                          variant="outline"
                          className={clsx(
                            "border text-xs px-3 py-1 h-fit font-medium",
                            {
                              "bg-green-50 text-green-600 border-green-200":
                                student.status === "active",
                              "bg-blue-50 text-blue-600 border-blue-200":
                                student.status === "rest",
                              "bg-yellow-50 text-yellow-600 border-yellow-200":
                                student.status === "transfered",
                              "bg-red-50 text-red-600 border-red-200":
                                student.status === "resign",
                            }
                          )}
                        >
                          {statusTranslations[student.status] || student.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchText
                  ? "Tidak ada data siswa yang sesuai dengan pencarian"
                  : "Tidak ada data siswa"}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 pt-4 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center border-t space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="text-sm text-gray-500 text-center sm:text-left">
              Menampilkan {displayedStudents.length} dari{" "}
              {filteredStudents.length} siswa
            </div>
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="text-sm text-gray-600">Baris:</span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={handleRowsPerPageChange}
              >
                <SelectTrigger className="w-16 h-8 border-gray-200 focus:ring-green-400 rounded-lg">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent className="w-16 min-w-[4rem]">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="text-gray-700 rounded-lg h-8 w-8 hover:bg-green-50 hover:text-green-600 hover:border-green-500 transition-colors"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={safePage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-sm text-gray-600 px-2">
              Halaman {safePage} dari {totalPages}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="text-gray-700 rounded-lg h-8 w-8 hover:bg-green-50 hover:text-green-600 hover:border-green-500 transition-colors"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={safePage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Conditionally render modals for teachers only */}
      {userType === "teacher" && (
        <>
          <ConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Hapus Siswa"
            description="Apakah anda yakin ingin menghapus siswa ini? Data yang dihapus tidak dapat dikembalikan."
            confirmText="Hapus"
            cancelText="Batal"
            type="delete"
          />
          <ConfirmationModal
            isOpen={isModalDeleteAllOpen}
            onClose={() => setIsModalDeleteAllOpen(false)}
            onConfirm={handleConfirmDeleteByClass}
            title="Hapus Siswa Kelas Ini"
            description="Apakah anda yakin ingin menghapus semua siswa di kelas ini? Data yang dihapus tidak dapat dikembalikan."
            confirmText="Hapus "
            cancelText="Batal"
            type="delete"
          />
          <ConfirmationModal
            isOpen={isModalExportOpen}
            onClose={() => setIsModalExportOpen(false)}
            onConfirm={handleConfirmExportData}
            title="Konfirmasi Ekspor Data"
            description="Apakah Anda yakin ingin mengekspor data kelas ini ke dalam file excel?"
            confirmText="Ekspor"
            cancelText="Batal"
            type="add"
          />
        </>
      )}
    </div>
  );
};

export default ViewStudentByClass;
