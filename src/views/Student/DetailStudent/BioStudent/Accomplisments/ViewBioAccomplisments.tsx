import { useEffect, useState, useMemo } from "react";
import {
  MoveLeft,
  Trash2,
  Trophy,
  Calendar,
  Award,
  Search,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { useStudentById } from "@/config/Api/useStudent";
import {
  useAccomplishmentById,
  useAccomplishmentDelete,
  useAccomplishmentsByStudentId,
  useAccomplishmentsDocumentationDelete,
} from "@/config/Api/useAccomplishments";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/shared/component/DatePicker";
import ConfirmationModal from "@/components/ui/confirmation";
import toast from "react-hot-toast";
import { useAccomplishmentsType } from "@/config/Api/useAccomplismentsType";
import { useAccomplishmentsRanks } from "@/config/Api/useAccomplishmentsRanks";
import { useAccomplishmentsLevel } from "@/config/Api/useAccomplishmentsLevel";
import ImageModal from "@/components/shared/component/ImageModal";

const ViewBioAccomplishments = () => {
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [userType, setUserType] = useState<"teacher" | "student">("teacher");
  const [filters, setFilters] = useState({
    searchTerm: "",
    selectedDate: "",
  });
  const [accomplishmentsDelete, setaccomplishmentsDelete] = useState<
    number | null
  >(null);
  const { id } = useParams();
  const studentId = id ?? "";

  // Fetch student data
  const {
    data: student,
    isLoading: studentLoading,
    error,
  } = useStudentById(studentId);

  // Fetch accomplishment details
  const { data: accomplishmentTypes } = useAccomplishmentsType();
  const { data: accomplishmentRanks } = useAccomplishmentsRanks();
  const { data: accomplishmentLevels } = useAccomplishmentsLevel();

  // Create lookup objects for accomplishment details
  const typeLookup = useMemo(() => {
    return accomplishmentTypes?.reduce((acc, type) => {
      acc[Number(type.id)] = type.type;
      return acc;
    }, {} as Record<number, string>);
  }, [accomplishmentTypes]);

  const rankLookup = useMemo(() => {
    return accomplishmentRanks?.reduce((acc, rank) => {
      acc[Number(rank.id)] = rank.rank;
      return acc;
    }, {} as Record<number, string>);
  }, [accomplishmentRanks]);

  const levelLookup = useMemo(() => {
    return accomplishmentLevels?.reduce((acc, level) => {
      acc[Number(level.id)] = level.level;
      return acc;
    }, {} as Record<number, string>);
  }, [accomplishmentLevels]);

  const deleteDocumentation = useAccomplishmentsDocumentationDelete();
  const { data: accomplishments } = useAccomplishmentById(
    accomplishmentsDelete ?? 0
  );

  const studentName = student ? student.name : "Memuat...";

  const { data: studentAccomplishments = [] } =
    useAccomplishmentsByStudentId(studentId);
  const deleteAccomplishment = useAccomplishmentDelete();

  useEffect(() => {
    // Check user type from localStorage
    const teacherId = localStorage.getItem("teacher_id");
    const studentId = localStorage.getItem("student_id");
    setUserType(teacherId ? "teacher" : studentId ? "student" : "teacher");
  }, []);

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const LoadingSpinner: React.FC = () => {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  };

  const handleOpenImageModal = (url: string) => {
    setSelectedImageUrl(url);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageUrl(null);
  };

  const handleDeleteAccomplishment = (id: number) => {
    setDeletingId(id);
    setaccomplishmentsDelete(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accomplishmentsDelete) return;

    setIsModalOpen(false);
    setaccomplishmentsDelete(null);

    toast.loading("Menghapus data...", { id: "delete-loading" });

    try {
      if (accomplishments?.image_documentation) {
        await deleteDocumentation.mutateAsync(accomplishmentsDelete);
      }

      await deleteAccomplishment.mutateAsync(accomplishmentsDelete);

      toast.success("Data prestasi berhasil dihapus", { id: "delete-loading" });
    } catch (error) {
      toast.error("Gagal menghapus data prestasi", { id: "delete-loading" });
      console.error("Gagal menghapus prestasi:", error);
    }
  };

  // Format accomplishments with details
  const formattedAccomplishments = useMemo(() => {
    return studentAccomplishments.map((accomplishment) => ({
      id: accomplishment.id,
      type: typeLookup?.[accomplishment.type_id] || "Unknown",
      rank: rankLookup?.[accomplishment.rank_id] || "Unknown",
      description: accomplishment.description,
      date: accomplishment.accomplishment_date,
      level: levelLookup?.[accomplishment.level_id] || "Unknown",
      image_documentation: accomplishment.image_documentation,
      points: accomplishment.points,
      created_at: accomplishment.created_at,
      updated_at: accomplishment.updated_at,
    }));
  }, [studentAccomplishments, typeLookup, rankLookup, levelLookup]);

  const totalPoints = useMemo(() => {
    return studentAccomplishments.reduce(
      (sum, accomplishment) => sum + accomplishment.points,
      0
    );
  }, [studentAccomplishments]);

  const lastAccomplishmentDate = useMemo(() => {
    return studentAccomplishments.length > 0
      ? studentAccomplishments.reduce((latest, accomplishment) => {
          const currentDate = new Date(accomplishment.accomplishment_date);
          return currentDate > latest ? currentDate : latest;
        }, new Date(studentAccomplishments[0].accomplishment_date))
      : null;
  }, [studentAccomplishments]);

  const formatStatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy");
  };

  const clearFilters = () => {
    setFilters({
      selectedDate: "",
      searchTerm: "",
    });
  };

  const parseApiDate = (dateString: string) => {
    return new Date(dateString);
  };

  const hasActiveFilters = Object.values(filters).some(
    (filter) => filter !== ""
  );

  const filteredAccomplishments = useMemo(() => {
    return formattedAccomplishments.filter((accomplishment) => {
      if (
        filters.searchTerm &&
        !accomplishment.type
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) &&
        !accomplishment.description
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase())
      ) {
        return false;
      }

      if (filters.selectedDate) {
        const accomplishmentDate = parseApiDate(accomplishment.date);
        const selectedDate = parseApiDate(filters.selectedDate);

        if (accomplishmentDate.toDateString() !== selectedDate.toDateString()) {
          return false;
        }
      }
      return true;
    });
  }, [formattedAccomplishments, filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      searchTerm: e.target.value,
    }));
    setCurrentPage(1);
  };

  const handleDateChange = (date?: Date) => {
    setFilters((prev) => ({
      ...prev,
      selectedDate: date ? format(date, "yyyy-MM-dd") : "",
    }));
  };

  const itemsPerPage = parseInt(rowsPerPage);
  const totalPages = Math.ceil(filteredAccomplishments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAccomplishments = filteredAccomplishments.slice(
    startIndex,
    endIndex
  );

  if (studentLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            Error Memuat Data
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Gagal memuat data pelanggaran. Silakan coba lagi.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {userType === "teacher" && (
        <div className="flex items-center">
          <Link to={`/studentbio/${student?.id}`} className="group">
            <div className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 group-hover:border-green-500 group-hover:bg-green-50 transition-all">
                <MoveLeft className="h-4 w-4" />
              </div>
              <span className="font-medium">Kembali</span>
            </div>
          </Link>
        </div>
      )}

      {/* Header Section with Gradient Background */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 sm:p-6 shadow-md">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <div className="bg-green-600/40 p-2 sm:p-3 rounded-lg mr-3">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Riwayat Prestasi
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  <span className="font-semibold">{studentName}</span>
                </p>
              </div>
            </div>

            {/* Total Points Card */}
            <div className="bg-green-500 rounded-xl p-4 text-white shadow-sm min-w-[140px] sm:min-w-[160px]">
              <div className="flex items-center gap-3">
                <div className="bg-green-600/40 p-2 rounded-lg">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{totalPoints}</p>
                  <p className="text-xs sm:text-sm text-green-100">
                    Total Poin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Card className="rounded-xl overflow-hidden shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {studentAccomplishments.length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Total Prestasi
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl overflow-hidden shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {lastAccomplishmentDate
                    ? formatStatDate(lastAccomplishmentDate.toString())
                    : "Tidak ada data"}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Prestasi Terakhir
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accomplishments Table */}
      <Card className="rounded-xl overflow-hidden shadow-sm">
        <CardHeader className="px-4 sm:px-6 pt-4 pb-4 border-b-2 border-green-500">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              <span className="hidden sm:inline">Riwayat Prestasi Siswa</span>
              <span className="sm:hidden">Prestasi</span>
            </CardTitle>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  className="pl-10 pr-4 py-2 w-full sm:w-auto"
                  placeholder="Cari prestasi..."
                  value={filters.searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              {/* Date Picker */}
              <div className="w-full sm:w-36">
                <DatePicker
                  value={
                    filters.selectedDate
                      ? new Date(filters.selectedDate)
                      : undefined
                  }
                  onChange={handleDateChange}
                  isForm={false}
                />
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800 h-8 w-full sm:w-auto"
                >
                  <X className="h-3 w-3 mr-1" />
                  Hapus
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {paginatedAccomplishments.length > 0 ? (
              <div className="space-y-4 p-4">
                {paginatedAccomplishments.map((accomplishment) => (
                  <Card
                    key={accomplishment.id}
                    className="border border-gray-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 uppercase text-sm">
                            {accomplishment.type}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {accomplishment.description}
                          </p>
                        </div>
                        {userType !== "student" && (
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-red-200 hover:bg-red-50"
                              onClick={() =>
                                handleDeleteAccomplishment(accomplishment.id)
                              }
                              disabled={deletingId === accomplishment.id}
                            >
                              {deletingId === accomplishment.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Peringkat:</span>
                          <Badge
                            variant="outline"
                            className="ml-2 bg-blue-50 text-blue-700 border-blue-200 text-xs"
                          >
                            {accomplishment.rank}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-500">Tanggal:</span>
                          <span className="ml-2 font-medium">
                            {accomplishment.date}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Level:</span>
                          <Badge
                            variant="outline"
                            className="ml-2 bg-purple-50 text-purple-700 border-purple-200 text-xs"
                          >
                            {accomplishment.level}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-500">Poin:</span>
                          <Badge
                            variant="outline"
                            className="ml-2 bg-green-100 text-green-700 border-green-200 text-xs"
                          >
                            {accomplishment.points}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500 py-12">
                <Award className="h-8 w-8 text-gray-300" />
                <p className="text-center">Tidak ada prestasi ditemukan</p>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto p-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50 border-b-2 border-gray-200">
                  <TableHead className="text-center font-semibold text-gray-900 py-4">
                    No
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4">
                    Tipe Prestasi
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-900 py-4">
                    Peringkat
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-900 py-4">
                    Deskripsi
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-900 py-4">
                    Dokumentasi
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-900 py-4">
                    Tanggal
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-900 py-4">
                    Level Kompetisi
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-900 py-4">
                    Poin
                  </TableHead>
                  {userType !== "student" && (
                    <TableHead className="text-center font-semibold text-gray-900 py-4">
                      Aksi
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAccomplishments.length > 0 ? (
                  paginatedAccomplishments.map((accomplishment, index) => (
                    <TableRow
                      key={accomplishment.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="text-center font-medium py-4">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="font-medium py-4 uppercase">
                        {accomplishment.type}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {accomplishment.rank}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        {accomplishment.description}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        {accomplishment.image_documentation ? (
                          <button
                            onClick={() =>
                              handleOpenImageModal(
                                `${import.meta.env.VITE_API_URL?.replace(
                                  "/api",
                                  "/public"
                                )}${accomplishment.image_documentation}`
                              )
                            }
                            className="inline-block bg-blue-500 text-white font-semibold px-3 py-1 rounded hover:bg-blue-600 transition duration-200"
                          >
                            Lihat Gambar
                          </button>
                        ) : (
                          <span className="text-gray-600">
                            Tidak Ada Dokumentasi
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        {accomplishment.date}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          {accomplishment.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-700 border-green-200"
                        >
                          {accomplishment.points}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        {userType !== "student" && (
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                              onClick={() =>
                                handleDeleteAccomplishment(accomplishment.id)
                              }
                              disabled={deletingId === accomplishment.id}
                            >
                              {deletingId === accomplishment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Award className="h-8 w-8 text-gray-300" />
                        <p>Tidak ada prestasi ditemukan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="px-4 sm:px-6 pt-4 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-t space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-sm text-gray-500">
                Menampilkan{" "}
                {Math.min(startIndex + 1, filteredAccomplishments.length)} -{" "}
                {Math.min(endIndex, filteredAccomplishments.length)} dari{" "}
                {filteredAccomplishments.length} prestasi
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Baris:</span>
                <Select
                  value={rowsPerPage}
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

            {totalPages > 1 && (
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8 text-xs"
                >
                  Sebelumnya
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-8 w-8 p-0 text-xs"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-8 text-xs"
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={handleCloseImageModal}
          imageUrl={selectedImageUrl}
        />
      </Card>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Prestasi Ini"
        description="Apakah anda yakin ingin menghapus prestasi siswa ini? Data yang dihapus tidak dapat dikembalikan."
        confirmText="Hapus"
        cancelText="Batal"
        type="delete"
      />
    </div>
  );
};

export default ViewBioAccomplishments;
