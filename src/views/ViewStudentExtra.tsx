import React, { useState, useMemo, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  GraduationCap,
  Search,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import {
  useExtracurriculars,
  useAssignExtracurricular,
  useExtracurricularsByStudentId,
  useDeleteExtracurricular,
} from "@/config/Api/useExtracurriculars";
import { IChooseExtracurricular, IExtracurricular } from "@/config/Models/Extracurriculars";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import ConfirmationModal from "@/components/ui/confirmation";
import { AxiosError } from "axios"; // Asumsikan ada hook untuk auth

const MAX_SELECTION = 3;

const ViewStudentExtra = () => {

  const studentId = localStorage.getItem("student_id") || "";
  // State management
  const [filters, setFilters] = useState({
    searchTerm: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [selectedExtracurriculars, setSelectedExtracurriculars] = useState<
    number[]
  >([]);

  // Modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extracurricularToDelete, setExtracurricularToDelete] = useState<
    number | null
  >(null);

  // API hooks
  const { data: extracurricularsData, isLoading } = useExtracurriculars();
const {
  data: registeredExtras,
  refetch: refetchRegistered,
} = useExtracurricularsByStudentId(studentId);
  const assignMutation = useAssignExtracurricular();
  const { deleteExtracurricular, isLoading: isDeleting } =
    useDeleteExtracurricular();

  // Process data
  useEffect(() => {
    if (extracurricularsData) {
      setSelectedExtracurriculars([]);
    }
  }, [extracurricularsData]);

  // Calculate remaining slots
  const registeredCount = registeredExtras?.length || 0;
  const remainingSlots = MAX_SELECTION - registeredCount;

  // Filter only active extracurriculars
  const filteredData = useMemo(() => {
    if (!extracurricularsData) return [];

    return (
      extracurricularsData
        .filter((item) => item.status === "active" && item.id !== undefined)
        .filter((item) => {
          if (!filters.searchTerm) return true;
          const searchLower = filters.searchTerm.toLowerCase();
          return (
            item.name.toLowerCase().includes(searchLower) ||
            (item.trainer?.name &&
              item.trainer.name.toLowerCase().includes(searchLower))
          );
        })
        .filter(
          (item) =>
            !registeredExtras?.some(
              (registered: IExtracurricular) => registered.id === item.id
            )
        )
    );
  }, [extracurricularsData, filters, registeredExtras]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / parseInt(rowsPerPage));
  const startIndex = (currentPage - 1) * parseInt(rowsPerPage);
  const endIndex = startIndex + parseInt(rowsPerPage);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchTerm: e.target.value }));
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

const handleSelectExtracurricular = (id: number) => {
  setSelectedExtracurriculars((prev) => {
    if (prev.includes(id)) {
      return prev.filter((item) => item !== id);
    } else {
      if (prev.length >= remainingSlots) {
        toast.error(
          `Anda hanya dapat memilih ${remainingSlots} ekstrakurikuler lagi`,
          { id: "extracurricular-limit" }
        );
        return prev;
      }
      return [...prev, id];
    }
  });
};

  // New function to cancel all selections
  const handleCancelSelection = () => {
    setSelectedExtracurriculars([]);
    toast.success("Pilihan dibatalkan");
  };

  // Function to open confirmation modal
  const openConfirmationModal = () => {
    if (selectedExtracurriculars.length === 0) {
      toast.error("Pilih minimal 1 ekstrakurikuler");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  // Function to handle registration after confirmation
  const handleConfirmRegistration = async () => {
    setIsConfirmModalOpen(false);
    setIsProcessing(true);

    try {
      const payload: IChooseExtracurricular = {
        extracurricular_ids: selectedExtracurriculars,
      };

      await assignMutation.mutateAsync(payload);
      toast.success("Berhasil mendaftar ekstrakurikuler");
      setSelectedExtracurriculars([]);
      refetchRegistered(); // Refresh registered list
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          toast.error(`Gagal mendaftar: ${error.response.data.message}`);
        } else {
          toast.error("Gagal mendaftar ekstrakurikuler");
        }
      } else {
        toast.error("Gagal mendaftar ekstrakurikuler");
      }
      console.error("Registration error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle delete confirmation
  const confirmDelete = (id: number) => {
    setExtracurricularToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Handle actual deletion
  const handleDelete = async () => {
    if (!extracurricularToDelete) return;

    try {
      await deleteExtracurricular(extracurricularToDelete);
      toast.success("Ekstrakurikuler berhasil dihapus");
      refetchRegistered(); // Refresh registered list
    } catch (error) {
      toast.error("Gagal menghapus ekstrakurikuler");
      console.error("Delete error:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setExtracurricularToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen md:max-w-screen-xl mx-auto text-sm sm:text-base md:text-base">
      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmRegistration}
        title="Konfirmasi Pendaftaran"
        description={`Apakah Anda yakin ingin mendaftar di ${selectedExtracurriculars.length} ekstrakurikuler?`}
        confirmText="Ya, Daftar"
        cancelText="Batal"
        type="add"
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Konfirmasi Penghapusan"
        description="Apakah Anda yakin ingin menghapus ekstrakurikuler ini?"
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="delete"
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 sm:p-6 shadow-md mb-6">
        <div className="flex items-center mb-2">
          <div className="bg-green-600/40 p-2 rounded-lg mr-3">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black leading-tight">
            Pendaftaran Ekstrakurikuler
          </h1>
        </div>
        <p className="text-gray-600 max-w-3xl leading-relaxed">
          Pilih maksimal {MAX_SELECTION} ekstrakurikuler yang ingin diikuti
        </p>
      </div>

      {/* Registered Extracurriculars Table */}
      {registeredExtras &&
        registeredExtras.length > 0 && (
          <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
            <div className="px-4 sm:px-6 pt-4 pb-2">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-green-500" />
                <h2 className="text-xl font-bold text-gray-900">
                  Ekstrakurikuler Terdaftar
                </h2>
                <Badge className="bg-green-100 text-green-800 ml-2">
                  Terdaftar: {registeredCount}/{MAX_SELECTION}
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="hover:bg-gray-50">
                    <TableHead className="text-center font-medium text-black w-12">
                      No
                    </TableHead>
                    <TableHead className="text-left font-medium text-black">
                      Nama Ekstrakurikuler
                    </TableHead>
                    <TableHead className="text-center font-medium text-black">
                      Pembina
                    </TableHead>
                    <TableHead className="text-center font-medium text-black">
                      Peserta
                    </TableHead>
                    <TableHead className="text-center font-medium text-black">
                      Status
                    </TableHead>
                    <TableHead className="text-center font-medium text-black">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registeredExtras?.map((item: IExtracurricular, index : number) => (
                    <TableRow
                      key={item.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <TableCell className="text-center px-4 py-3 text-gray-500">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-left px-4 py-3 font-medium">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-center px-4 py-3">
                        {item.trainer?.name || "-"}
                      </TableCell>
                      <TableCell className="text-center px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {item.students_count || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-center px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-600">
                          Terdaftar
                        </span>
                      </TableCell>
                      <TableCell className="text-center px-4 py-3">
                        <Button
                          variant="ghost"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => confirmDelete(item.id!)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

      {/* Available Extracurriculars */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 pt-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <h2 className="text-xl font-bold text-gray-900">
                Daftar Ekstrakurikuler Aktif
              </h2>
              {registeredCount > 0 && (
                <Badge className="bg-green-100 text-green-800">
                  Sisa Kuota: {remainingSlots}
                </Badge>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {selectedExtracurriculars.length > 0 && (
                <Badge className="bg-green-100 text-green-800">
                  Terpilih: {selectedExtracurriculars.length}/{remainingSlots}
                </Badge>
              )}

              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Cari ekstrakurikuler..."
                  value={filters.searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {/* DESKTOP */}
        <div className="hidden md:block overflow-x-auto pt-3 relative">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="hover:bg-gray-50">
                <TableHead className="text-center font-medium text-black w-12">
                  No
                </TableHead>
                <TableHead className="text-left font-medium text-black">
                  Nama Ekstrakurikuler
                </TableHead>
                <TableHead className="text-center font-medium text-black">
                  Pembina
                </TableHead>
                <TableHead className="text-center font-medium text-black">
                  Peserta
                </TableHead>
                <TableHead className="text-center font-medium text-black">
                  Status
                </TableHead>
                <TableHead className="text-center font-medium text-black">
                  Pilih
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => {
                  const isSelected = selectedExtracurriculars.includes(
                    item.id!
                  );
                  const isDisabled = remainingSlots <= 0 && !isSelected;

                  return (
                    <TableRow
                      key={item.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <TableCell className="text-center px-4 py-3 text-gray-500">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="text-left px-4 py-3 font-medium">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-center px-4 py-3">
                        {item.trainer?.name || "-"}
                      </TableCell>
                      <TableCell className="text-center px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {item.students_count || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-center px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-600">
                          Aktif
                        </span>
                      </TableCell>
                      <TableCell className="text-center px-4 py-3 mr-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            handleSelectExtracurricular(item.id!)
                          }
                          disabled={isDisabled}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 px-4">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <AlertCircle className="h-8 w-8 text-gray-300" />
                      <p>
                        {remainingSlots <= 0
                          ? "Anda sudah mendaftar di maksimal ekstrakurikuler"
                          : "Tidak ada ekstrakurikuler aktif ditemukan"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* MOBILE */}
        <div className="md:hidden flex flex-col gap-2">
          {paginatedData.length > 0 ? (
            paginatedData.map((item, index) => {
              const isSelected = selectedExtracurriculars.includes(
                item.id!
              );
              const isDisabled = remainingSlots <= 0 && !isSelected;

              return (
                <div
                  key={item.id}
                  className="bg-white p-2 px-4">
                  <div className="p-4 flex gap-4 border rounded-xl shadow-sm w-full">
                    <div className="w-[80%]">
                      <div className="text-xl font-bold">{item.name}</div>
                      <div>{item.trainer?.name || '-'}</div>
                      <div className="flex justify-between items-center mt-6">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-gray-200 rounded-xl text-xs font-semibold">
                            {item.students_count || 0}
                          </span>
                          <span className="text-sm">Peserta</span>
                        </div>
                        <div className="px-3 py-1 bg-green-400 rounded-xl text-xs font-semibold text-white">Aktif</div>
                      </div>
                    </div>
                    <div className="w-[20%] flex justify-center items-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() =>
                          handleSelectExtracurricular(item.id!)
                        }
                        className="h-6 w-6"
                        disabled={isDisabled}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 px-4">
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <AlertCircle className="h-8 w-8 text-gray-300" />
                  <p>
                    {remainingSlots <= 0
                      ? "Anda sudah mendaftar di maksimal ekstrakurikuler"
                      : "Tidak ada ekstrakurikuler aktif ditemukan"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </div>

        {/* Pagination and Submit */}
        <div className="mt-3 px-4 sm:px-6 pt-4 pb-4 flex flex-col sm:mt-0 sm:flex-row sm:justify-between sm:items-center border-t gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="text-sm text-gray-500 text-center sm:text-left">
              Menampilkan {startIndex + 1} -{" "}
              {Math.min(endIndex, filteredData.length)} dari{" "}
              {filteredData.length}
            </div>
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="text-sm text-gray-600">Per halaman:</span>
              <Select
                value={rowsPerPage}
                onValueChange={handleRowsPerPageChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {selectedExtracurriculars.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-red-500 border-red-500 hover:bg-red-50 flex items-center"
                  onClick={handleCancelSelection}
                  disabled={isProcessing || assignMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Batalkan Pilih
                </Button>

                <Button
                  onClick={openConfirmationModal}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isProcessing || assignMutation.isPending}
                >
                  {assignMutation.isPending || isProcessing ? (
                    <>
                      <span className="animate-spin mr-2">↻</span>
                      Memproses...
                    </>
                  ) : (
                    `Daftar (${selectedExtracurriculars.length})`
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudentExtra;
