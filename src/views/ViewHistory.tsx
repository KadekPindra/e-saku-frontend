// ViewHistory Component - Updated to fetch accomplishment details
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ChevronLeft,
  ChevronRight,
  History,
  Loader2,
  Search,
  Trash2,
  UploadIcon,
  X,
} from "lucide-react";
import { DatePicker } from "@/components/shared/component/DatePicker";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useViolationDelete,
  useViolationsByTeacherId,
} from "@/config/Api/useViolation";
import { IViolation } from "@/config/Models/Violation";
import {
  useAccomplishmentDelete,
  useAccomplishmentsByTeacherId,
} from "@/config/Api/useAccomplishments";
import { IAccomplishments } from "@/config/Models/Accomplishments";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/ui/confirmation";
import { Link } from "react-router-dom";
import { useStudentHistoryExport } from "@/config/Api/useStudent";
import { useAccomplishmentsType } from "@/config/Api/useAccomplismentsType";
import { useAccomplishmentsRanks } from "@/config/Api/useAccomplishmentsRanks";
import { useAccomplishmentsLevel } from "@/config/Api/useAccomplishmentsLevel";

// Helper function to format date as YYYY-MM-DD in local time
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to format display date
const formatDisplayDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

interface EnhancedAccomplishment extends IAccomplishments {
  typeName: string;
  rankName: string;
  levelName: string;
}

const ViewHistory = () => {
  const [selectedHistory, setSelectedHistory] = useState<
    "violationhistory" | "accomplishmenthistory"
  >("violationhistory");
  const [classType, setClassType] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalExportOpen, setIsModalExportOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Table states
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");

  // Get the logged-in teacher's ID from localStorage
  const teacherId = localStorage.getItem("teacher_id") || "";

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    type: "violation" | "accomplishment";
  } | null>(null);

  // Delete mutations
  const deleteViolation = useViolationDelete();
  const deleteAccomplishment = useAccomplishmentDelete();

  const { refetch: refetchViolations } = useViolationsByTeacherId(teacherId);
  const { refetch: refetchAccomplishments } =
    useAccomplishmentsByTeacherId(teacherId);

  const exportHistory = useStudentHistoryExport();

  // Fetch accomplishment details
  const { data: accomplishmentTypes } = useAccomplishmentsType();
  const { data: accomplishmentRanks } = useAccomplishmentsRanks();
  const { data: accomplishmentLevels } = useAccomplishmentsLevel();

  // Create lookup objects for accomplishment details
  const typeLookup = useMemo(() => {
    return accomplishmentTypes?.reduce((acc, type) => {
      acc[type.id] = type.type;
      return acc;
    }, {} as Record<string, string>);
  }, [accomplishmentTypes]);

  const rankLookup = useMemo(() => {
    return accomplishmentRanks?.reduce((acc, rank) => {
      acc[rank.id] = rank.rank;
      return acc;
    }, {} as Record<string, string>);
  }, [accomplishmentRanks]);

  const levelLookup = useMemo(() => {
    return accomplishmentLevels?.reduce((acc, level) => {
      acc[level.id] = level.level;
      return acc;
    }, {} as Record<string, string>);
  }, [accomplishmentLevels]);

  // Fetch data hooks
  const {
    data: violationsData,
    isLoading: isLoadingViolations,
    isError: isErrorViolations,
    error: errorViolations,
  } = useViolationsByTeacherId(teacherId);

  const {
    data: accomplishmentsData,
    isLoading: isLoadingAccomplishments,
    isError: isErrorAccomplishments,
    error: errorAccomplishments,
  } = useAccomplishmentsByTeacherId(teacherId);

  // Enhance accomplishments data with details
  const enhancedAccomplishments = useMemo<EnhancedAccomplishment[]>(() => {
    if (!accomplishmentsData || !typeLookup || !rankLookup || !levelLookup)
      return [];

    return accomplishmentsData.map((accomplishment) => ({
      ...accomplishment,
      typeName: typeLookup[accomplishment.type_id] || "Unknown",
      rankName: rankLookup[accomplishment.rank_id] || "Unknown",
      levelName: levelLookup[accomplishment.level_id] || "Unknown",
    }));
  }, [accomplishmentsData, typeLookup, rankLookup, levelLookup]);

  const handleHistoryChange = (value: string) => {
    if (value === "violationhistory" || value === "accomplishmenthistory") {
      setSelectedHistory(value);
      setCurrentPage(1);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date || null);
    setCurrentPage(1);
  };

  const handleDeleteClick = (
    id: number,
    type: "violation" | "accomplishment"
  ) => {
    setItemToDelete({ id, type });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleteModalOpen(false);
    const loadingToastIdDelete = toast.loading("Menghapus data...");
    try {
      if (itemToDelete.type === "violation") {
        await deleteViolation.mutateAsync(itemToDelete.id);
        toast.success("Data pelanggaran berhasil dihapus", {
          id: loadingToastIdDelete,
        });
        await refetchViolations();
      } else {
        await deleteAccomplishment.mutateAsync(itemToDelete.id);
        toast.success("Data prestasi berhasil dihapus", {
          id: loadingToastIdDelete,
        });
        await refetchAccomplishments();
      }
    } catch (error) {
      toast.error("Gagal menghapus data");
      console.error("Delete error:", error);
    } finally {
      setItemToDelete(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set timeout baru
    searchTimeoutRef.current = setTimeout(() => {
      setSearchText(value);
      setCurrentPage(1);
    }, 300);
  };

  // Bersihkan timeout saat komponen unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleConfirmExportData = async () => {
    try {
      await exportHistory();
      setIsModalExportOpen(false);
      toast.success("File berhasil diunduh");
    } catch (error) {
      console.error("Ekspor Gagal:", error);
      toast.error("Gagal mengekspor file");
    }
  };

  const handleFileExport = () => {
    setIsModalExportOpen(true);
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedDate(null);
    setClassType("");
    setSelectedClassId(null);
    setSearchText("");
    setCurrentPage(1);
  };

  const isFilterActive = selectedDate || classType || searchText;
  const filteredData = useMemo(() => {
    if (selectedHistory === "violationhistory") {
      return (
        violationsData?.filter(
          (violation) =>
            searchText === "" ||
            violation.student?.name
              ?.toLowerCase()
              .includes(searchText.toLowerCase()) ||
            violation.rules_of_conduct?.name
              ?.toLowerCase()
              .includes(searchText.toLowerCase()) ||
            violation.violation_date
              ?.toLowerCase()
              .includes(searchText.toLowerCase())
        ) || []
      );
    } else {
      return (
        enhancedAccomplishments?.filter(
          (accomplishment) =>
            searchText === "" ||
            accomplishment.student?.name
              ?.toLowerCase()
              .includes(searchText.toLowerCase()) ||
            accomplishment.typeName
              ?.toLowerCase()
              .includes(searchText.toLowerCase()) ||
            accomplishment.rankName
              ?.toLowerCase()
              .includes(searchText.toLowerCase()) ||
            accomplishment.levelName
              ?.toLowerCase()
              .includes(searchText.toLowerCase()) ||
            accomplishment.accomplishment_date
              ?.toLowerCase()
              .includes(searchText.toLowerCase())
        ) || []
      );
    }
  }, [searchText, violationsData, enhancedAccomplishments, selectedHistory]);

  // Apply date filter with proper timezone handling
  const filteredDataWithDate = useMemo(() => {
    if (!selectedDate) return filteredData;

    // Format selected date to YYYY-MM-DD in local time
    const dateStr = formatDate(selectedDate);

    if (selectedHistory === "violationhistory") {
      return filteredData.filter((violation) =>
        violation.violation_date?.includes(dateStr)
      );
    } else {
      return filteredData.filter((accomplishment) =>
        accomplishment.accomplishment_date?.includes(dateStr)
      );
    }
  }, [filteredData, selectedDate, selectedHistory]);

  // Apply class filter
  const finalFilteredData = useMemo(() => {
    if (!selectedClassId) return filteredDataWithDate;

    return filteredDataWithDate.filter(
      (item) => item.student?.classroom?.id === selectedClassId
    );
  }, [filteredDataWithDate, selectedClassId]);

  // Pagination
  const totalPages = Math.ceil(
    finalFilteredData.length / parseInt(rowsPerPage)
  );
  const startIndex = (currentPage - 1) * parseInt(rowsPerPage);
  const endIndex = startIndex + parseInt(rowsPerPage);
  const displayedData = finalFilteredData.slice(startIndex, endIndex);

  // Reset page if current page is beyond total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Determine loading and error states
  const isLoading =
    selectedHistory === "violationhistory"
      ? isLoadingViolations
      : isLoadingAccomplishments;

  const isError =
    selectedHistory === "violationhistory"
      ? isErrorViolations
      : isErrorAccomplishments;

  const error =
    selectedHistory === "violationhistory"
      ? errorViolations
      : errorAccomplishments;

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h2 className="font-bold text-lg">Gagal memuat data</h2>
          <p>{error?.message || "Terjadi kesalahan yang tidak diketahui"}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 sm:p-6 mb-6 shadow-md">
        <div className="flex items-center mb-2">
          <div className="bg-green-600/40 p-2 rounded-lg mr-3">
            <History className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Histori
          </h1>
        </div>
        <p className="text-gray-600 max-w-3xl text-sm sm:text-base">
          Lihat dan kelola riwayat aktivitas siswa
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="w-full flex justify-between sm:w-[180px]">
          <div className="flex gap-4 w-full">
          <div className="relative w-48 bg-white rounded-md">
              <Select
                onValueChange={handleHistoryChange}
                value={selectedHistory}
              >
                <SelectTrigger className="w-44 pr-auto">
                  <SelectValue placeholder="Pilih Histori" />
                </SelectTrigger>
                <SelectContent className="w-44">
                  <SelectGroup>
                    <SelectItem value="violationhistory">
                      Histori Pelanggaran
                    </SelectItem>
                    <SelectItem value="accomplishmenthistory">
                      Histori Prestasi
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleFileExport}
              variant="outline"
              className="text-green-600 hover:text-white hover:bg-green-600 border border-green-500 transition-all duration-300 w-full sm:w-auto"
            >
              <UploadIcon className="mr-2 h-4 w-4" />
              Ekspor ke Excel
            </Button>
          </div>
        </div>
      </div>

      <Card className="rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 pt-4 pb-4 border-b-2 border-green-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
              {selectedHistory === "violationhistory"
                ? "Histori Pelanggaran"
                : "Histori Prestasi"}
            </CardTitle>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex items-center gap-2">
                {isFilterActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-gray-600 hover:text-gray-800 h-8 w-full sm:w-auto"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Hapus Filter
                  </Button>
                )}
                <DatePicker value={selectedDate} onChange={handleDateChange} />
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  onChange={handleInputChange}
                  placeholder={
                    selectedHistory === "violationhistory"
                      ? "Cari data pelanggaran..."
                      : "Cari data prestasi..."
                  }
                  className="pl-9 bg-white border-gray-200 w-full rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-12 text-center px-6 font-medium text-black">
                  No
                </TableHead>
                <TableHead className="text-center font-medium text-black">
                  NIS
                </TableHead>
                <TableHead className="text-center font-medium text-black">
                  Nama
                </TableHead>

                {selectedHistory === "violationhistory" ? (
                  <>
                    <TableHead className="text-center font-medium text-black">
                      Jenis Pelanggaran
                    </TableHead>
                    <TableHead className="text-center font-medium text-black">
                      Tindak Lanjut
                    </TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="text-center font-medium text-black">
                      Jenis Prestasi
                    </TableHead>
                    <TableHead className="text-center font-medium text-black">
                      Peringkat
                    </TableHead>
                    <TableHead className="text-center font-medium text-black">
                      Tingkat
                    </TableHead>
                  </>
                )}

                <TableHead className="text-center font-medium text-black">
                  Tanggal
                </TableHead>
                <TableHead className="text-center font-medium text-black">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="text-center px-6">
                      <Skeleton className="h-4 w-6 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-32 mx-auto" />
                    </TableCell>

                    {selectedHistory === "violationhistory" ? (
                      <>
                        <TableCell className="text-center">
                          <Skeleton className="h-4 w-24 mx-auto" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-4 w-24 mx-auto" />
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-center">
                          <Skeleton className="h-4 w-24 mx-auto" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-4 w-16 mx-auto" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-4 w-20 mx-auto" />
                        </TableCell>
                      </>
                    )}

                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-3">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-5 w-5 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // Actual data rows
                <>
                  {displayedData.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <TableCell className="text-center px-6 font-normal">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="text-center font-normal">
                        {item.student?.nis}
                      </TableCell>
                      <TableCell className="text-center font-normal">
                        <Link
                          to={`/studentbio/${item.student?.id}`}
                          className="hover:text-green-500 transition-colors"
                        >
                          {item.student?.name}
                        </Link>
                      </TableCell>

                      {selectedHistory === "violationhistory" ? (
                        <>
                          <TableCell className="text-center font-normal">
                            {(item as IViolation).rules_of_conduct?.name}
                          </TableCell>
                          <TableCell className="text-center font-normal">
                            {(item as IViolation).action}
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-center font-normal">
                            {(item as EnhancedAccomplishment).typeName}
                          </TableCell>
                          <TableCell className="text-center font-normal">
                            {(item as EnhancedAccomplishment).rankName}
                          </TableCell>
                          <TableCell className="text-center font-normal">
                            {(item as EnhancedAccomplishment).levelName || "-"}
                          </TableCell>
                        </>
                      )}

                      <TableCell className="text-center font-normal">
                        {selectedHistory === "violationhistory"
                          ? formatDisplayDate(
                              (item as IViolation).violation_date
                            )
                          : formatDisplayDate(
                              (item as IAccomplishments).accomplishment_date
                            )}
                      </TableCell>
                      <TableCell className="text-center font-normal">
                        <div className="flex justify-center">
                          <button
                            onClick={() =>
                              handleDeleteClick(
                                item.id,
                                selectedHistory === "violationhistory"
                                  ? "violation"
                                  : "accomplishment"
                              )
                            }
                            disabled={
                              deleteViolation.isPending ||
                              deleteAccomplishment.isPending
                            }
                            className="p-2 text-red-500 hover:text-red-600 disabled:opacity-50"
                          >
                            {deleteViolation.isPending ||
                            deleteAccomplishment.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {displayedData.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={selectedHistory === "violationhistory" ? 7 : 8}
                        className="text-center py-8 text-gray-500"
                      >
                        Tidak ada data yang sesuai dengan pencarian
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile & Tablet Card List */}
        <div className="md:hidden space-y-3 p-4">
          {isLoading ? (
            // Skeleton loading for mobile/tablet
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))
          ) : (
            // Actual data for mobile/tablet
            <>
              {displayedData.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {startIndex + index + 1}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          {item.student?.nis || "N/A"}
                        </span>
                      </div>
                      <div className="text-base font-semibold text-gray-900">
                        <Link
                          to={`/studentbio/${item.student?.id}`}
                          className="hover:text-green-500 transition-colors"
                        >
                          {item.student?.name}
                        </Link>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          handleDeleteClick(
                            item.id,
                            selectedHistory === "violationhistory"
                              ? "violation"
                              : "accomplishment"
                          )
                        }
                        disabled={
                          deleteViolation.isPending ||
                          deleteAccomplishment.isPending
                        }
                        className="p-1 text-red-500 hover:text-red-600 disabled:opacity-50"
                      >
                        {deleteViolation.isPending ||
                        deleteAccomplishment.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {selectedHistory === "violationhistory" ? (
                    <>
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Pelanggaran:</span>{" "}
                        {(item as IViolation).rules_of_conduct?.name || "-"}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Tindak Lanjut:</span>{" "}
                        {(item as IViolation).action || "-"}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Prestasi:</span>{" "}
                        {(item as EnhancedAccomplishment).typeName || "-"}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Peringkat:</span>{" "}
                        {(item as EnhancedAccomplishment).rankName || "-"}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Tingkat:</span>{" "}
                        {(item as EnhancedAccomplishment).levelName || "-"}
                      </div>
                    </>
                  )}

                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Tanggal:</span>{" "}
                    {selectedHistory === "violationhistory"
                      ? formatDisplayDate((item as IViolation).violation_date)
                      : formatDisplayDate(
                          (item as IAccomplishments).accomplishment_date
                        )}
                  </div>
                </div>
              ))}

              {displayedData.length === 0 && (
                <div className="text-center py-8 text-gray-500 border rounded-lg">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="h-8 w-8 text-gray-400" />
                    <p>Tidak ada data yang sesuai dengan pencarian</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination - Responsive */}
        <div className="px-4 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="text-sm text-gray-500 text-center sm:text-left">
              Menampilkan {startIndex + 1} -{" "}
              {Math.min(endIndex, finalFilteredData.length)} dari{" "}
              {finalFilteredData.length} data
            </div>
            <div className="flex items-center justify-center gap-2">
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
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="text-gray-700 rounded-lg h-8 w-8 hover:bg-green-50 hover:text-green-600 hover:border-green-500 transition-colors"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-sm text-gray-600 min-w-[100px] text-center">
              Halaman {currentPage} dari {Math.max(1, totalPages)}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="text-gray-700 rounded-lg h-8 w-8 hover:bg-green-50 hover:text-green-600 hover:border-green-500 transition-colors"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage >= totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data"
        description="Apakah Anda yakin ingin menghapus data ini? Data yang dihapus tidak dapat dikembalikan."
        confirmText="Hapus"
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
  );
};

export default ViewHistory;
