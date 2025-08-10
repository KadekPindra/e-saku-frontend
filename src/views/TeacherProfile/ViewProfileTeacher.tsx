import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  X,
  Edit,
  Save,
  Lock,
  User,
  Clock,
  Eye,
  EyeOff,
  BookOpen,
  Users,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useTeacherById,
  useTeacherDeleteProfile,
  useTeacherUpdate,
  useTeacherUpdatePassword,
  useTeacherUpload,
} from "@/config/Api/useTeacher";
import { useClassroomByTeacherId } from "@/config/Api/useClasroom";
import { Button } from "@/components/ui/button";
import { ITeacher } from "@/config/Models/Teacher";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/ui/confirmation";

type InputValueType = string | number | null;

const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error format tanggal:", error);
    return "Tanggal tidak valid";
  }
};

const ViewProfileTeacher = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ITeacher | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditingPassword, setIsEditingPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [lastActive, setLastActive] = useState<string>("14.50 di Menu Siswa");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const teacherId = localStorage.getItem("teacher_id");

  const updateMutation = useTeacherUpdate();
  const updatePassword = useTeacherUpdatePassword();
  const uploadMutation = useTeacherUpload();
  const deleteProfileMutation = useTeacherDeleteProfile();

  const {
    data: teacher,
    isLoading,
    refetch,
  } = useTeacherById(teacherId ? Number(teacherId) : 0);

  const { data: classrooms, isLoading: loadingClassrooms } =
    useClassroomByTeacherId();

  useEffect(() => {
    if (teacher) {
      setFormData(teacher);
      if (teacher.profile_image) {
        setPhotoUrl(
          `${import.meta.env.VITE_API_URL?.replace("/api", "/public")}${
            teacher.profile_image
          }`
        );
      }
      // Read last_activity from localStorage and format it
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
          setLastActive(teacher.last_active || "N/A");
        }
      } else if (teacher.last_active) {
        setLastActive(teacher.last_active);
      }
    }
  }, [teacher]);

  useEffect(() => {
    if (!isEditingPassword) {
      setPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isEditingPassword]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChangeAvatar = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const localUrl = URL.createObjectURL(file);
        setPhotoUrl(localUrl);
        setSelectedFile(file);
        console.log("File selected:", file);
      } else {
        console.log("No file selected");
      }
    };

    fileInput.click();
  };

  const handleSavePhoto = () => {
    if (!selectedFile || !teacherId) return;

    uploadMutation.mutate(
      { id: teacherId, file: selectedFile },
      {
        onSuccess: () => {
          toast.success("Foto profil berhasil diubah!");
          setSelectedFile(null);
        },
        onError: () => {
          toast.error("Gagal mengubah foto profil!");
        },
      }
    );
  };

  const imageSrc = photoUrl
    ? photoUrl
    : teacher?.profile_image
    ? `${import.meta.env.VITE_API_URL?.replace("/api", "/public")}${
        teacher.profile_image
      }`
    : "";

  const handleDeleteProfile = () => {
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setDeleteModalOpen(false);
    if (!teacherId) return;

    deleteProfileMutation.mutate(teacherId, {
      onSuccess: () => {
        toast.success("Foto profil berhasil dihapus!");
        setPhotoUrl(undefined);
        setSelectedFile(null);
      },
      onError: () => {
        toast.error("Gagal menghapus foto profil!");
      },
    });
  };

  const handleInputChange = (field: string, value: InputValueType) => {
    if (formData) {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (isEditing && teacher) {
      setFormData(teacher);
    }
  };

  const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleSaveChanges = () => {
    if (!formData || !teacherId) return;

    const updateData = {
      name: formData.name,
      teacher_code: formData.teacher_code,
      email: formData.email,
      nip: String(formData.nip),
    };

    updateMutation.mutate(
      {
        id: Number(teacherId),
        data: updateData,
      },
      {
        onSuccess: () => {
          setSuccessMessage("Data profil berhasil diperbarui!");
          setIsEditing(false);
          refetch();
        },
        onError: (error) => {
          console.error("Error updating data:", error);
          setSuccessMessage("Gagal memperbarui profil. Coba lagi.");
        },
      }
    );
  };

  const handleUpdatePassword = () => {
    // Validasi dasar

    if (password && password.length < 6) {
      setPasswordError("Password harus minimal 6 karakter");
      return false;
    }

    if (!password) {
      setPasswordError("Masukkan password baru");
      return;
    }

    if (!confirmPassword) {
      setPasswordError("Konfirmasi password harus diisi");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Password dan konfirmasi tidak cocok");
      return;
    }

    if (!teacherId) {
      console.error("ID guru tidak ditemukan");
      return;
    }

    updatePassword.mutate(
      {
        id: teacherId,
        data: {
          password,
          password_confirmation: confirmPassword,
        },
      },
      {
        onSuccess: () => {
          setSuccessMessage("Password berhasil diperbarui!");
          toast.success("Password berhasil diperbarui!");
          setPassword("");
          setConfirmPassword("");
          setIsEditingPassword(false);
        },
        onError: () => {
          setPasswordError("Gagal memperbarui password. Coba lagi.");
        },
      }
    );
  };

  if (isLoading || loadingClassrooms) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-14 h-14 border-4 border-gray-300 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!teacher || !formData) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-600 text-lg font-medium">
          Gagal memuat data profil
        </p>
        <Button
          onClick={() => navigate("/")}
          variant="default"
          className="mt-4 hover:bg-[#009616] hover:text-white transition-all"
        >
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 text-black">
      {successMessage && (
        <div className="mb-4 sm:mb-6 p-3 bg-green-100 text-green-800 rounded-lg flex justify-between items-center">
          <div className="flex items-center">
            <span className="mr-2">✓</span>
            {successMessage}
          </div>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-green-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-black">
          Biodata Guru
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,300px)_1fr] gap-4 sm:gap-6 lg:gap-8">
        <div className="space-y-4 sm:space-y-6">
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
                {photoUrl ? (
                  <img
                    src={imageSrc}
                    alt="Teacher profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-400"
                    strokeWidth={1}
                  />
                )}
              </div>

              <div className="space-y-2 w-full">
                {selectedFile ? (
                  <Button
                    onClick={handleSavePhoto}
                    disabled={!selectedFile}
                    variant="default"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all"
                  >
                    Simpan Foto
                  </Button>
                ) : (
                  <Button
                    onClick={handleChangeAvatar}
                    variant="default"
                    className="w-full bg-green-600 hover:bg-green-700 text-white transition-all"
                  >
                    <Camera size={16} className="mr-2" />
                    Ubah Foto
                  </Button>
                )}

                <Button
                  onClick={handleDeleteProfile}
                  variant="default"
                  className="w-full bg-red-600 hover:bg-red-700 text-white transition-all"
                >
                  <Trash2 size={16} className="mr-2" />
                  Hapus Foto
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200 bg-white rounded-lg overflow-hidden">
            <CardHeader className="bg-white py-3 px-4">
              <CardTitle className="text-center text-black flex items-center justify-center gap-2">
                <BookOpen size={20} className="text-green-600" />
                Kelas yang Diajarkan
              </CardTitle>
              <div className="relative flex justify-center mt-5">
                <div className="absolute w-64 h-0.5 bg-green-400 rounded-full shadow-sm mt-1"></div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {classrooms && classrooms.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Users size={16} className="text-green-600" />
                    <span>Total: {classrooms.length} kelas</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {classrooms.map((classroom, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          navigate(`/student/class/${classroom.id}`)
                        }
                        className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 text-center"
                      >
                        {classroom.display_name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={20} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Belum ada kelas</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Hubungi admin untuk penugasan
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-3 flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2 text-green-600" />
            Terakhir aktif pada {lastActive}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label
                      htmlFor="teacher-nip"
                      className="block text-sm font-medium text-black mb-1"
                    >
                      NIP
                    </label>
                    {isEditing ? (
                      <input
                        id="teacher-nip"
                        type="number"
                        value={formData.nip || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "nip",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      />
                    ) : (
                      <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                        {formData.nip || "Tidak diatur"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="teacher-code"
                      className="block text-sm font-medium text-black mb-1"
                    >
                      Kode Guru
                    </label>
                    {isEditing ? (
                      <input
                        id="teacher-code"
                        type="text"
                        value={formData.teacher_code || ""}
                        onChange={(e) =>
                          handleInputChange("teacher_code", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      />
                    ) : (
                      <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                        {formData.teacher_code}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="teacher-name"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Nama
                  </label>
                  {isEditing ? (
                    <input
                      id="teacher-name"
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      required
                    />
                  ) : (
                    <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                      {formData.name}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="teacher-email"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      id="teacher-email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  ) : (
                    <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                      {formData.email || "Tidak diatur"}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Dibuat Pada
                    </label>
                    <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                      {formatDate(formData.created_at ?? "")}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Diperbarui Pada
                    </label>
                    <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                      {formatDate(formData.updated_at ?? "")}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end items-center mt-6 gap-3">
                  {!isEditing && !isEditingPassword ? (
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button
                        onClick={toggleEditMode}
                        variant="default"
                        className="hover:bg-[#009616] hover:text-white transition-all"
                      >
                        <Edit size={16} className="mr-2" />
                        Edit Profil
                      </Button>
                      <Button
                        onClick={() => setIsEditingPassword(true)}
                        variant="default"
                        className="hover:bg-[#009616] hover:text-white transition-all"
                      >
                        <Lock size={16} className="mr-2" />
                        Perbarui Password
                      </Button>
                    </div>
                  ) : isEditing ? (
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="hover:bg-gray-50 transition-all"
                      >
                        <X size={16} className="mr-2" />
                        Batal
                      </Button>
                      <Button
                        onClick={handleSaveChanges}
                        variant="default"
                        className="hover:bg-[#009616] hover:text-white transition-all"
                      >
                        <Save size={16} className="mr-2" />
                        Simpan
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button
                        onClick={() => setIsEditingPassword(false)}
                        variant="outline"
                        className="hover:bg-gray-50 transition-all"
                      >
                        <X size={16} className="mr-2" />
                        Batal
                      </Button>
                      <Button
                        onClick={handleUpdatePassword}
                        variant="default"
                        className="hover:bg-[#009616] hover:text-white transition-all"
                        disabled={!password || !confirmPassword}
                      >
                        <Lock size={16} className="mr-2" />
                        Perbarui Password
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {isEditingPassword && (
            <Card className="shadow-sm border border-gray-200 bg-white rounded-lg overflow-hidden">
              <CardHeader className="bg-white py-3 px-4">
                <CardTitle className="text-black flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  Manajemen Password
                </CardTitle>
                <div className="relative flex justify-center mt-5">
                  <div className="absolute w-full h-0.5 bg-green-400 rounded-full shadow-sm mt-1"></div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-black mb-1"
                    >
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none pr-10"
                        placeholder="Masukkan password baru"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("password")}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-black mb-1"
                    >
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full p-2 border rounded-lg focus:ring-2 outline-none pr-10 ${
                          passwordError
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                        }`}
                        placeholder="Konfirmasi password baru"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          togglePasswordVisibility("confirmPassword")
                        }
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {passwordError}
                      </p>
                    )}
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Persyaratan password:</p>
                    <ul className="list-disc pl-6 mt-1">
                      <li>Minimal 6 karakter</li>
                      <li>Kedua password harus cocok</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        description="Apa kamu yakin untuk menghapus foto profil ini?"
        title="Hapus Foto Profil"
        confirmText="Hapus"
        type="delete"
      />
    </div>
  );
};

export default ViewProfileTeacher;
