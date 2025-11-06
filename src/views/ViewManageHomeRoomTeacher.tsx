// Di komponen ViewManageHomeroomTeacher.tsx - ganti bagian yang diperlukan
import React, { useState, useEffect, useMemo, useRef } from "react";
import { ApiHomeTEachers } from "@/config/Services/HomeTeacher.service";
import { IHomeTeacher } from "@/config/Models/HomeTeachers";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Pencil,
  Trash2,
  Plus,
  AlertCircle,
  GraduationCap,
  School,
  Mail,
  Phone,
  MapPin,
  Save,
  UserRoundCheck,
  List,
} from "lucide-react";
import FormFieldGroup from "@/components/shared/component/FormField";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationModal from "@/components/ui/confirmation";
import {
  useAssignHomeroomTeacherToClassroom,
  useClassroom,
  useRemoveHomeroomTeacherFromClassroom,
  useClassroomByAssignHomeroomTeacherId
} from "@/config/Api/useClasroom";
import { useHomeTeacherUpdate } from "@/config/Api/useHomeTeachers";
import { Textarea } from "@/components/ui/textarea";

const ViewManageHomeroomTeacher: React.FC = () => {
  const inputClass =
    "border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg h-10";

  const updateHomeTeacherData = useHomeTeacherUpdate();
  const assignHomeroomTeacherMutation = useAssignHomeroomTeacherToClassroom();
  const removeHomeroomTeacherMutation = useRemoveHomeroomTeacherFromClassroom();

  const { data: classroomsList } = useClassroom();
  const [homeTeachers, setHomeTeachers] = useState<IHomeTeacher[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<HTMLDivElement>(null);
  const teachersTabRef = useRef<HTMLButtonElement>(null);
  const classesTabRef = useRef<HTMLButtonElement>(null);
  const [activeTab, setActiveTab] = useState<"teachers" | "classes">(
    "teachers"
  );
  const [dialogType, setDialogType] = useState<"editTeacher" | "assignTeacher">(
    "editTeacher"
  );

  // Separate search states for each tab
  const [teachersSearchText, setTeachersSearchText] = useState<string>("");
  const [classesSearchText, setClassesSearchText] = useState<string>("");

  // Separate pagination states for each tab
  const [teachersCurrentPage, setTeachersCurrentPage] = useState<number>(1);
  const [classesCurrentPage, setClassesCurrentPage] = useState<number>(1);
  const [teachersRowsPerPage, setTeachersRowsPerPage] = useState<number>(10);
  const [classesRowsPerPage, setClassesRowsPerPage] = useState<number>(10);

  const [searchClassroom, setSearchClassroom] = useState("");
  const [classroomsToDelete, setClassroomsToDelete] = useState<number[]>([]);
  const [assignedByOtherTeachers, setAssignedByOtherTeachers] = useState<
    number[]
  >([]);

  const [isDeleteAssignedModalOpen, setIsDeletAssignedeModalOpen] =
    useState(false);

  const [formData, setFormData] = useState<IHomeTeacher>({
    id: 0,
    nip: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    profile_image: "",
  });

  const resetFormEditTeacher = () => {
    setFormData({
      id: 0,
      nip: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      profile_image: "",
    });
  };

  // State untuk dialog assign teacher
  const [selectedClassrooms, setSelectedClassrooms] = useState<
    { id: string; name: string }[]
  >([]);
  const [initiallyAssigned, setInitiallyAssigned] = useState<number[]>([]);
  const [classroomsToRemove, setClassroomsToRemove] = useState<number[]>([]);

  const resetFormAssignedTeacher = () => {
    setSelectedClassrooms([]);
    setInitiallyAssigned([]);
    setClassroomsToRemove([]);
  };

  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    teacherId: number;
    teacherName: string;
  } | null>(null);

  const { data: homeTeachersData, refetch } = useQuery<IHomeTeacher[]>({
    queryKey: ["home-teachers"],
    queryFn: () => ApiHomeTEachers.getAll(),
    enabled: true,
  });

  // GUNAKAN HOOK BARU - PERUBAHAN PENTING
  const {
    data: assignedClassroomsData,
    isLoading: isLoadingAssigned,
    error: assignedError,
  } = useClassroomByAssignHomeroomTeacherId(
    dialogType === "assignTeacher" ? formData.id : 0
  );

  useEffect(() => {
    if (dialogType === "assignTeacher" && assignedClassroomsData) {
      if (Array.isArray(assignedClassroomsData)) {
        const assignedIds = assignedClassroomsData.map((c) => c.id);
        setInitiallyAssigned(assignedIds);

        if (!classroomsList) {
          console.warn("Classrooms list is not available");
          return;
        }

        // PERBAIKAN: Filter berdasarkan homeroom_teacher_id bukan teacher_id
        const assignedByOthers = classroomsList
          .filter(
            (c) =>
              c.homeroom_teacher_id && c.homeroom_teacher_id !== formData.id
          )
          .map((c) => c.id);

        setAssignedByOtherTeachers(assignedByOthers);
        setSelectedClassrooms(
          assignedIds.map((id) => {
            const classroom = classroomsList.find((c) => c.id === id);
            return {
              id: id.toString(),
              name: classroom?.display_name || "Kelas tidak ditemukan",
            };
          })
        );
      } else if (assignedError) {
        console.error("Error fetching assigned classrooms:", assignedError);
        toast.error("Gagal memuat data kelas yang diampu");
        setInitiallyAssigned([]);
        setSelectedClassrooms([]);
      }
    }
  }, [
    assignedClassroomsData,
    assignedError,
    dialogType,
    formData.id,
    classroomsList,
  ]);

  useEffect(() => {
    if (homeTeachersData) {
      setHomeTeachers(homeTeachersData);
      setIsLoading(false);
    }
  }, [homeTeachersData]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    // Set the indicator position immediately when the page loads (first tab is "teachers")
    const initialTabElement =
      activeTab === "teachers" ? teachersTabRef.current : classesTabRef.current;

    if (initialTabElement && tabsRef.current) {
      const tabRect = initialTabElement.getBoundingClientRect();
      const navRect = tabsRef.current.getBoundingClientRect();

      setIndicatorStyle({
        left: tabRect.left - navRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab]);

  const handleTabChange = (tab: "teachers" | "classes") => {
    setActiveTab(tab);

    const tabRef = tab === "teachers" ? teachersTabRef : classesTabRef;
    if (tabRef.current && tabsRef.current) {
      const tabRect = tabRef.current.getBoundingClientRect();
      const containerRect = tabsRef.current.getBoundingClientRect();

      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  };

  // Filter teachers based on search
  const filteredTeachers = useMemo(() => {
    if (!teachersSearchText.trim()) return homeTeachers;

    const lowerSearchText = teachersSearchText.toLowerCase();
    return homeTeachers.filter((teacher) => {
      const nameMatch = teacher.name.toLowerCase().includes(lowerSearchText);
      const nipMatch = teacher.nip
        ? teacher.nip.toLowerCase().includes(lowerSearchText)
        : false;
      const emailMatch = teacher.email
        ? teacher.email.toLowerCase().includes(lowerSearchText)
        : false;
      const phoneMatch = teacher.phone
        ? teacher.phone.toLowerCase().includes(lowerSearchText)
        : false;

      return nameMatch || nipMatch || emailMatch || phoneMatch;
    });
  }, [homeTeachers, teachersSearchText]);

  // Filter classes based on search
  const filteredClasses = useMemo(() => {
    if (!classroomsList) return [];
    if (!classesSearchText.trim()) return classroomsList;

    const lowerSearchText = classesSearchText.toLowerCase();
    return classroomsList.filter((classroom) => {
      const displayNameMatch = classroom.display_name
        .toLowerCase()
        .includes(lowerSearchText);
      const gradeMatch = classroom.grade?.name
        .toLowerCase()
        .includes(lowerSearchText);
      const majorMatch = classroom.major?.name
        .toLowerCase()
        .includes(lowerSearchText);
      const homeroomTeacherMatch = classroom.homeroom_teacher?.name
        ?.toLowerCase()
        .includes(lowerSearchText);

      return (
        displayNameMatch || gradeMatch || majorMatch || homeroomTeacherMatch
      );
    });
  }, [classroomsList, classesSearchText]);

  const teachersPagination = useMemo(() => {
    const totalPages = Math.ceil(filteredTeachers.length / teachersRowsPerPage);
    const startIndex = (teachersCurrentPage - 1) * teachersRowsPerPage;
    const paginatedData = filteredTeachers.slice(
      startIndex,
      startIndex + teachersRowsPerPage
    );
    return {
      paginatedData,
      totalPages,
      currentData: filteredTeachers,
      currentPage: teachersCurrentPage,
      rowsPerPage: teachersRowsPerPage,
    };
  }, [filteredTeachers, teachersCurrentPage, teachersRowsPerPage]);

  // Handle pagination for teachers
  const handleTeachersPageChange = (newPage: number) => {
    setTeachersCurrentPage(newPage);
  };

  const handleTeachersRowsPerPageChange = (newRowsPerPage: number) => {
    setTeachersRowsPerPage(newRowsPerPage);
    setTeachersCurrentPage(1); // Reset to first page
  };

  // Classes pagination
  const classesPagination = useMemo(() => {
    const totalPages = Math.ceil(filteredClasses.length / classesRowsPerPage);
    const startIndex = (classesCurrentPage - 1) * classesRowsPerPage;
    const paginatedData = filteredClasses.slice(
      startIndex,
      startIndex + classesRowsPerPage
    );
    return {
      paginatedData,
      totalPages,
      currentData: filteredClasses,
      currentPage: classesCurrentPage,
      rowsPerPage: classesRowsPerPage,
    };
  }, [filteredClasses, classesCurrentPage, classesRowsPerPage]);

  // Handle pagination for classes
  const handleClassesPageChange = (newPage: number) => {
    setClassesCurrentPage(newPage);
  };

  const handleClassesRowsPerPageChange = (newRowsPerPage: number) => {
    setClassesRowsPerPage(newRowsPerPage);
    setClassesCurrentPage(1); // Reset to first page
  };

  // Get current pagination data based on active tab
  const currentPaginationData =
    activeTab === "teachers" ? teachersPagination : classesPagination;

  // Handle search changes for each tab
  const handleTeachersSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTeachersSearchText(e.target.value);
    setTeachersCurrentPage(1); // Reset to first page when searching
  };

  const handleClassesSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setClassesSearchText(e.target.value);
    setClassesCurrentPage(1); // Reset to first page when searching
  };

  const handleClassSelection = (classId: string, name: string) => {
    const classIdNum = parseInt(classId);
    const isSelected = selectedClassrooms.some((c) => c.id === classId);

    if (isSelected) {
      if (initiallyAssigned.includes(classIdNum)) {
        setClassroomsToRemove((prev) => [...prev, classIdNum]);
      }
      if (assignedByOtherTeachers.includes(classIdNum)) {
        toast.error("Kelas ini sudah diampu oleh wali kelas lain");
        return;
      }
      setSelectedClassrooms(selectedClassrooms.filter((c) => c.id !== classId));
    } else {
      setClassroomsToRemove((prev) => prev.filter((id) => id !== classIdNum));
      setSelectedClassrooms([...selectedClassrooms, { id: classId, name }]);
    }
  };

  const handleDialogEditTeacherOpen = (item: IHomeTeacher) => {
    setFormData({
      id: item.id,
      nip: item.nip,
      name: item.name,
      email: item.email,
      phone: item.phone,
      address: item.address,
      profile_image: item.profile_image,
    });
    setDialogType("editTeacher");
    setIsEditDialogOpen(true);
  };

  const handleDialogAssignedOpen = (teacherId: number) => {
    setDialogType("assignTeacher");
    setIsEditDialogOpen(true);
    resetFormAssignedTeacher();

    const teacher = homeTeachers.find((t) => t.id === teacherId);
    if (teacher) {
      setFormData({
        id: teacher.id,
        nip: teacher.nip,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        address: teacher.address,
        profile_image: teacher.profile_image,
      });
    }

    // PERBAIKAN: Gunakan homeroom_teacher_id untuk menentukan kelas yang sudah diampu
    const classroomsWithTeachers = classroomsList || [];
    const assignedByOthers = classroomsWithTeachers
      .filter(
        (c) => c.homeroom_teacher_id && c.homeroom_teacher_id !== teacherId
      )
      .map((c) => c.id);

    setAssignedByOtherTeachers(assignedByOthers);
  };

  const handleAssignSubmit = async () => {
    setIsSubmitting(true);
    try {
      const teacherId = formData.id;

      const toAssign = selectedClassrooms
        .filter((c) => !initiallyAssigned.includes(parseInt(c.id)))
        .map((c) => parseInt(c.id));

      const toRemove = classroomsToRemove;

      const assignments = [];

      if (toAssign.length > 0) {
        assignments.push(
          assignHomeroomTeacherMutation.mutateAsync({
            classroomIds: toAssign,
            homeRoomTeacherId: teacherId,
          })
        );
      }

      if (toRemove.length > 0) {
        assignments.push(removeHomeroomTeacherMutation.mutateAsync(toRemove));
      }

      await Promise.all(assignments);

      toast.success("Perubahan kelas wali berhasil disimpan");
      setIsEditDialogOpen(false);
      resetFormAssignedTeacher();
      refetch(); // Refresh data
    } catch (error) {
      toast.error("Gagal menyimpan perubahan");
      console.error("Gagal menyimpan perubahan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClickDeleteAssignedTeacher = (classroomId: number) => {
    setIsDeletAssignedeModalOpen(true);
    setClassroomsToDelete([classroomId]);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { id, nip, name, email, phone, address } = formData;

      if (!id) throw new Error("ID wali kelas tidak ditemukan");

      await updateHomeTeacherData.mutateAsync({
        id,
        data: { nip, name, email, phone, address },
      });

      const loadingToastId = toast.loading("Memperbarui data ...");
      toast.success("Wali Kelas berhasil diperbarui", {
        id: loadingToastId,
      });
      setIsEditDialogOpen(false);
      resetFormEditTeacher();
      refetch(); // Refresh data
    } catch (error) {
      toast.error("Gagal memperbarui wali kelas");
      console.error("Gagal memperbarui wali kelas:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (id: number) => {
    try {
      setIsLoading(true);
      await ApiHomeTEachers.delete(id);
      toast.success("Wali kelas berhasil dihapus");
      refetch();
      setConfirmationModal(null);
    } catch (error) {
      console.error("Gagal menghapus wali kelas:", error);
      setError("Gagal menghapus wali kelas. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTeacher = async (classroomIds: number[]) => {
    try {
      await removeHomeroomTeacherMutation.mutateAsync(classroomIds);
      toast.success("Wali kelas berhasil dihapus dari kelas");
      setIsDeletAssignedeModalOpen(false);
      setClassroomsToDelete([]);
      refetch();
    } catch (error) {
      toast.error("Gagal menghapus wali kelas dari kelas");
      console.error("Gagal menghapus wali kelas:", error);
    }
  };

  const LoadingSpinner = () => (
    <div className="p-6 flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5">
          <h1 className="text-3xl font-bold text-green-500">
            Manajemen Wali Kelas
          </h1>
          <div className="mt-1 flex items-center">
            <span className="text-gray-600">
              Kelola data wali kelas dan informasi kelas
            </span>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-green-400 to-green-500"></div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <nav className="flex border-b border-gray-200" ref={tabsRef}>
            <button
              ref={teachersTabRef}
              className={`py-4 px-6 font-medium text-sm sm:text-base transition-all duration-300 ease-in-out ${
                activeTab === "teachers"
                  ? "text-green-500 bg-green-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handleTabChange("teachers")}
            >
              Wali Kelas
            </button>
            <button
              ref={classesTabRef}
              className={`py-4 px-6 font-medium text-sm sm:text-base transition-all duration-300 ease-in-out ${
                activeTab === "classes"
                  ? "text-green-500 bg-green-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handleTabChange("classes")}
            >
              Daftar Kelas
            </button>

            <div
              className="absolute bottom-0 h-0.5 bg-green-500 rounded-full transition-all duration-300 ease-in-out"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
              }}
            />
          </nav>
        </div>
      </div>

      <Card className="rounded-xl overflow-hidden shadow-sm border-gray-200">
        <div className="px-6 pt-4 pb-4 border-b-2 border-green-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <CardTitle className="text-xl flex items-center gap-2 font-bold text-gray-900">
              {activeTab === "teachers" ? (
                <GraduationCap className="h-5 w-5 text-green-500" />
              ) : (
                <School className="h-5 w-5 text-green-500" />
              )}
              {activeTab === "teachers" ? "Daftar Wali Kelas" : "Daftar Kelas"}
            </CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {activeTab === "teachers" && (
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white transition-all duration-300 w-full sm:w-auto"
                  onClick={() =>
                    toast("Fitur tambah wali kelas akan segera tersedia")
                  }
                >
                  <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Tambah Wali Kelas</span>
                </Button>
              )}

              <div className="relative flex w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={
                    activeTab === "teachers"
                      ? "Cari wali kelas..."
                      : "Cari kelas..."
                  }
                  value={
                    activeTab === "teachers"
                      ? teachersSearchText
                      : classesSearchText
                  }
                  onChange={
                    activeTab === "teachers"
                      ? handleTeachersSearchChange
                      : handleClassesSearchChange
                  }
                  className="pl-9 bg-white border-gray-200 w-full rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="px-6 py-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600 font-semibold mb-2">{error}</p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Coba Lagi
              </Button>
            </div>
          ) : (
            <div>
              {activeTab === "teachers" ? (
                <>
                  {/* Teachers Table for Desktop */}
                  <Table className="hidden md:table">
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="w-12 text-center px-6 font-medium text-black">
                          No
                        </TableHead>
                        <TableHead className="text-left font-medium text-black">
                          NIP
                        </TableHead>
                        <TableHead className="text-left font-medium text-black">
                          Nama
                        </TableHead>
                        <TableHead className="text-left font-medium text-black">
                          Email
                        </TableHead>
                        <TableHead className="text-left font-medium text-black">
                          Telepon
                        </TableHead>
                        <TableHead className="text-center font-medium text-black">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachersPagination.paginatedData.length > 0 ? (
                        teachersPagination.paginatedData.map(
                          (teacher, index) => (
                            <TableRow
                              key={teacher.id}
                              className="border-b hover:bg-gray-50"
                            >
                              <TableCell className="text-center px-6 font-normal">
                                {(teachersPagination.currentPage - 1) *
                                  teachersPagination.rowsPerPage +
                                  index +
                                  1}
                              </TableCell>
                              <TableCell className="text-left font-medium text-gray-900">
                                {teacher.nip || "-"}
                              </TableCell>
                              <TableCell className="text-left">
                                <div className="flex items-center gap-3">
                                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-500" />
                                  </div>
                                  <span>{teacher.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-left">
                                {teacher.email || "-"}
                              </TableCell>
                              <TableCell className="text-left">
                                {teacher.phone || "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-3 items-center">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      handleDialogAssignedOpen(teacher.id)
                                    }
                                    className="text-green-500 hover:text-green-600 hover:bg-green-50 border-green-200"
                                  >
                                    <UserRoundCheck className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      handleDialogEditTeacherOpen(teacher)
                                    }
                                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 border-blue-200"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      setConfirmationModal({
                                        isOpen: true,
                                        teacherId: teacher.id,
                                        teacherName: teacher.name,
                                      })
                                    }
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        )
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-12 text-gray-500"
                          >
                            <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium mb-2">
                              {teachersSearchText
                                ? "Tidak ada wali kelas yang sesuai dengan pencarian"
                                : "Belum ada data wali kelas"}
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Teachers Card View for Mobile/Tablet */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:hidden">
                    {teachersPagination.paginatedData.length > 0 ? (
                      teachersPagination.paginatedData.map((teacher) => (
                        <Card key={teacher.id} className="p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-grow">
                              <p className="font-bold text-gray-800">
                                {teacher.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                NIP: {teacher.nip || "Tidak ada"}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span>{teacher.email || "-"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{teacher.phone || "-"}</span>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleDialogAssignedOpen(teacher.id)
                              }
                              className="text-green-500 hover:text-green-600 hover:bg-green-50 border-green-200"
                            >
                              <UserRoundCheck className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleDialogEditTeacherOpen(teacher)
                              }
                              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 border-blue-200"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                setConfirmationModal({
                                  isOpen: true,
                                  teacherId: teacher.id,
                                  teacherName: teacher.name,
                                })
                              }
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-1 sm:col-span-2 text-center py-12 text-gray-500">
                        <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium mb-2">
                          {teachersSearchText
                            ? "Tidak ada wali kelas yang sesuai dengan pencarian"
                            : "Belum ada data wali kelas"}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Classes Table for Desktop */}
                  <Table className="hidden md:table">
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="w-12 text-center px-6 font-medium text-black">
                          No
                        </TableHead>
                        <TableHead className="text-left font-medium text-black">
                          Tingkat
                        </TableHead>
                        <TableHead className="text-left font-medium text-black">
                          Jurusan
                        </TableHead>
                        <TableHead className="text-left font-medium text-black">
                          Nama Kelas
                        </TableHead>
                        <TableHead className="text-left font-medium text-black">
                          Wali Kelas
                        </TableHead>
                        <TableHead className="text-center font-medium text-black">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classesPagination.paginatedData.length > 0 ? (
                        classesPagination.paginatedData.map(
                          (classroom, index) => (
                            <TableRow
                              key={classroom.id}
                              className="border-b hover:bg-gray-50"
                            >
                              <TableCell className="text-center px-6 font-normal">
                                {(classesPagination.currentPage - 1) *
                                  classesPagination.rowsPerPage +
                                  index +
                                  1}
                              </TableCell>
                              <TableCell className="text-left font-medium text-gray-900">
                                {classroom.grade?.name}
                              </TableCell>
                              <TableCell className="text-left">
                                {classroom.major?.name}
                              </TableCell>
                              <TableCell className="text-left">
                                {classroom.display_name}
                              </TableCell>
                              <TableCell className="text-left">
                                {classroom.homeroom_teacher ? (
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {classroom.homeroom_teacher.name}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-500">
                                    Belum ada wali kelas
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-3 items-center">
                                  {classroom.homeroom_teacher && (
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        handleClickDeleteAssignedTeacher(
                                          classroom.id
                                        )
                                      }
                                      className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                    >
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      Hapus Wali Kelas
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        )
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-12 text-gray-500"
                          >
                            <School className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium mb-2">
                              {classesSearchText
                                ? "Tidak ada kelas yang sesuai dengan pencarian"
                                : "Belum ada data kelas"}
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Classes Card View for Mobile/Tablet */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:hidden">
                    {classesPagination.paginatedData.length > 0 ? (
                      classesPagination.paginatedData.map((classroom) => (
                        <Card key={classroom.id} className="p-4 space-y-3">
                          <p className="font-bold text-gray-800">
                            {classroom.display_name}
                          </p>
                          <div>
                            <p className="text-sm text-gray-500">
                              {classroom.grade?.name} - {classroom.major?.name}
                            </p>
                          </div>
                          <div className="border-t pt-3">
                            <p className="font-medium text-sm text-gray-600 mb-1">
                              Wali Kelas:
                            </p>
                            {classroom.homeroom_teacher ? (
                              <div className="flex items-center gap-2">
                                <span>{classroom.homeroom_teacher.name}</span>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                Belum ada wali kelas
                              </span>
                            )}
                          </div>
                          {classroom.homeroom_teacher && (
                            <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleClickDeleteAssignedTeacher(classroom.id)
                                }
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 w-full"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus Wali Kelas
                              </Button>
                            </div>
                          )}
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-1 sm:col-span-2 text-center py-12 text-gray-500">
                        <School className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium mb-2">
                          {classesSearchText
                            ? "Tidak ada kelas yang sesuai dengan pencarian"
                            : "Belum ada data kelas"}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Pagination */}
              {currentPaginationData.currentData.length > 0 && (
                <div className="px-4 sm:px-6 pt-4 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center border-t space-y-4 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="text-sm text-gray-500 text-center sm:text-left">
                      Menampilkan {currentPaginationData.paginatedData.length}{" "}
                      dari {currentPaginationData.currentData.length}{" "}
                      {activeTab === "teachers" ? "wali kelas" : "kelas"}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <span className="text-sm text-gray-600">Baris:</span>
                      <Select
                        value={String(currentPaginationData.rowsPerPage)}
                        onValueChange={(value) => {
                          const newRowsPerPage = parseInt(value);
                          if (activeTab === "teachers") {
                            handleTeachersRowsPerPageChange(newRowsPerPage);
                          } else {
                            handleClassesRowsPerPageChange(newRowsPerPage);
                          }
                        }}
                      >
                        <SelectTrigger className="w-16 h-8 border-gray-200 focus:ring-green-400 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-16 min-w-[4rem]">
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-gray-700 rounded-lg h-8 w-8 hover:bg-green-50 hover:text-green-600 hover:border-green-500 transition-colors"
                      onClick={() => {
                        if (activeTab === "teachers") {
                          handleTeachersPageChange(
                            Math.max(currentPaginationData.currentPage - 1, 1)
                          );
                        } else {
                          handleClassesPageChange(
                            Math.max(currentPaginationData.currentPage - 1, 1)
                          );
                        }
                      }}
                      disabled={currentPaginationData.currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="text-sm text-gray-600 px-2">
                      Halaman {currentPaginationData.currentPage} dari{" "}
                      {currentPaginationData.totalPages}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="text-gray-700 rounded-lg h-8 w-8 hover:bg-green-50 hover:text-green-600 hover:border-green-500 transition-colors"
                      onClick={() => {
                        if (activeTab === "teachers") {
                          handleTeachersPageChange(
                            Math.min(
                              currentPaginationData.currentPage + 1,
                              currentPaginationData.totalPages
                            )
                          );
                        } else {
                          handleClassesPageChange(
                            Math.min(
                              currentPaginationData.currentPage + 1,
                              currentPaginationData.totalPages
                            )
                          );
                        }
                      }}
                      disabled={
                        currentPaginationData.currentPage >=
                        currentPaginationData.totalPages
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {dialogType === "editTeacher" ? (
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <School className="h-5 w-5 text-green-600" />
                <p>Edit Wali Kelas</p>
              </DialogTitle>
              <DialogDescription>
                Edit data wali kelas {formData.name}
              </DialogDescription>
            </DialogHeader>
          ) : (
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserRoundCheck className="h-5 w-5 text-green-600" />
                <p>Edit Kelas yang Diampu Wali</p>
              </DialogTitle>
              <DialogDescription>
                Edit kelas yang diampu oleh wali kelas {formData.name}
              </DialogDescription>
            </DialogHeader>
          )}

          {dialogType === "editTeacher" ? (
            <div className="grid grid-cols-1 gap-6 py-4">
              <FormFieldGroup
                label="NIP"
                icon={<User className="h-4 w-4 text-green-600" />}
              >
                <Input
                  value={formData.nip}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nip: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </FormFieldGroup>

              <FormFieldGroup
                label="Nama Wali Kelas"
                icon={<User className="h-4 w-4 text-green-600" />}
              >
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </FormFieldGroup>

              <FormFieldGroup
                label="Email"
                icon={<Mail className="h-4 w-4 text-green-600" />}
              >
                <Input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </FormFieldGroup>

              <FormFieldGroup
                label="Telepon"
                icon={<Phone className="h-4 w-4 text-green-600" />}
              >
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </FormFieldGroup>

              <FormFieldGroup
                label="Alamat"
                icon={<MapPin className="h-4 w-4 text-green-600" />}
              >
                <Textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className={inputClass.replace("h-10", "min-h-24")}
                />
              </FormFieldGroup>
            </div>
          ) : (
            <div className="flex flex-col gap-6 py-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <FormFieldGroup
                    label="Daftar Kelas"
                    icon={<School className="h-4 w-4 text-green-600" />}
                    required
                  >
                    <div className="relative w-full">
                      <div className="mb-2">
                        <Input
                          placeholder="Cari Kelas"
                          value={searchClassroom}
                          onChange={(e) => setSearchClassroom(e.target.value)}
                          className={inputClass}
                        />
                      </div>

                      <div className="max-h-60 overflow-y-auto border rounded-md">
                        {isLoadingAssigned ? (
                          <div className="p-4 flex justify-center">
                            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (classroomsList || []).filter((classroom) =>
                            classroom.display_name
                              .toLowerCase()
                              .includes(searchClassroom.toLowerCase())
                          ).length > 0 ? (
                          (classroomsList || [])
                            .filter((classroom) =>
                              classroom.display_name
                                .toLowerCase()
                                .includes(searchClassroom.toLowerCase())
                            )
                            .map((classroom) => {
                              const isSelected = selectedClassrooms.some(
                                (c) => c.id === classroom.id.toString()
                              );
                              const isAssignedByCurrent =
                                initiallyAssigned.includes(classroom.id);
                              const isAssignedByOther = Boolean(
                                classroom.homeroom_teacher_id &&
                                  classroom.homeroom_teacher_id !== formData.id
                              );

                              return (
                                <div
                                  key={classroom.id}
                                  className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
                                    isSelected ? "bg-green-50" : ""
                                  } ${isAssignedByOther ? "bg-red-50" : ""}`}
                                  onClick={() => {
                                    if (!isAssignedByOther) {
                                      handleClassSelection(
                                        classroom.id.toString(),
                                        classroom.display_name
                                      );
                                    }
                                  }}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    className="mr-3"
                                    disabled={isAssignedByOther}
                                  />
                                  <div className="flex-1">
                                    {classroom.display_name}

                                    {isAssignedByCurrent && (
                                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        Sudah Diampu (wali ini)
                                      </span>
                                    )}

                                    {isAssignedByOther &&
                                      classroom.homeroom_teacher && (
                                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                          Sudah Diampu oleh:{" "}
                                          {classroom.homeroom_teacher.name}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              );
                            })
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            Tidak ada kelas yang cocok
                          </div>
                        )}
                      </div>
                    </div>
                  </FormFieldGroup>
                </div>

                <div className="w-full md:w-1/2">
                  <FormFieldGroup
                    label="Kelas yang Dipilih"
                    icon={<List className="h-4 w-4 text-green-600" />}
                  >
                    <div className="w-full h-full max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {selectedClassrooms.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {selectedClassrooms.map((classroom) => {
                            const isInitiallyAssigned =
                              initiallyAssigned.includes(
                                parseInt(classroom.id)
                              );
                            return (
                              <div
                                key={classroom.id}
                                className="flex items-center justify-between p-2 border-b"
                              >
                                <div className="flex items-center">
                                  <span className="font-medium">
                                    {classroom.name}
                                  </span>
                                  {isInitiallyAssigned && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      Sudah Diampu
                                    </span>
                                  )}
                                </div>
                                {isInitiallyAssigned && (
                                  <span className="text-green-600">
                                    <UserRoundCheck className="w-4 h-4" />
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 h-full flex items-center justify-center">
                          <div>
                            <List className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                            <p>Belum ada kelas yang dipilih</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormFieldGroup>
                </div>
              </div>

              {/* Bagian kelas yang akan dihapus */}
              {classroomsToRemove.length > 0 && (
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="font-medium text-red-700 mb-2 flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Kelas yang akan dihapus dari wali kelas ini
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {classroomsToRemove.map((classId) => {
                      const classroom = classroomsList?.find(
                        (c) => c.id === classId
                      );
                      return (
                        <div
                          key={classId}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md flex items-center"
                        >
                          <span>
                            {classroom?.display_name || `Kelas ${classId}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setClassroomsToRemove((prev) =>
                                prev.filter((id) => id !== classId)
                              );
                              // Tambahkan kembali ke kelas yang dipilih
                              if (classroom) {
                                setSelectedClassrooms((prev) => [
                                  ...prev,
                                  {
                                    id: classId.toString(),
                                    name: classroom.display_name,
                                  },
                                ]);
                              }
                            }}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <span className="text-sm">×</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                if (dialogType === "editTeacher") {
                  resetFormEditTeacher();
                } else {
                  resetFormAssignedTeacher();
                }
              }}
              disabled={isSubmitting}
            >
              Tutup
            </Button>

            {dialogType === "assignTeacher" ? (
              <Button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isSubmitting}
                onClick={handleAssignSubmit}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Perbarui Wali Kelas
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isSubmitting}
                onClick={handleUpdate}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Perbarui Wali Kelas
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for deleting teacher */}
      {confirmationModal && (
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(null)}
          onConfirm={() => handleDeleteTeacher(confirmationModal.teacherId)}
          title="Hapus Wali Kelas"
          description={`Anda yakin ingin menghapus wali kelas "${confirmationModal.teacherName}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Hapus"
          type="delete"
        />
      )}

      {/* Confirmation Modal for removing teacher from classroom */}
      <ConfirmationModal
        isOpen={isDeleteAssignedModalOpen}
        onClose={() => {
          setIsDeletAssignedeModalOpen(false);
          setClassroomsToDelete([]);
        }}
        onConfirm={() => handleRemoveTeacher(classroomsToDelete)}
        title="Hapus Wali Kelas dari Kelas"
        description={`Anda yakin ingin menghapus wali kelas dari ${
          classroomsToDelete.length === 1
            ? "kelas ini"
            : `${classroomsToDelete.length} kelas`
        }? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        type="delete"
      />
    </div>
  );
};

export default ViewManageHomeroomTeacher;
