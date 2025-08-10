// import React, {
//   useState,
//   useMemo,
//   useCallback,
// } from "react";
// import {
//   Users,
//   X,
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   SquarePen,
//   Trash2,
//   Plus,
//   Shield,
//   Key,
//   Mail,
//   Phone,
//   Eye,
//   EyeOff,
//   Download,
//   Settings,
// } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";

// interface IUser {
//   id?: number;
//   name: string;
//   email: string;
//   phone: string;
//   role: "admin" | "teacher" | "staff" | "operator";
//   status: "active" | "inactive";
//   employee_id: string;
//   created_at?: string;
//   last_login?: string;
//   permissions?: string[];
// }

// interface IPermission {
//   id: string;
//   name: string;
//   description: string;
//   category: string;
// }

// const AVAILABLE_PERMISSIONS: IPermission[] = [
// ];

// const ROLE_PERMISSIONS = {
//   admin: AVAILABLE_PERMISSIONS.map(p => p.id),
//   teacher: [
//   ],
//   staff: [
//   ],
//   operator: [
//   ],
// };

const ViewManageUser = () => {
  // const [isLoading] = useState(false);
  // const [rowsPerPage, setRowsPerPage] = useState("10");
  // const [currentPage, setCurrentPage] = useState(1);
  // const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  // const [showPassword, setShowPassword] = useState(false);
  // const [formData, setFormData] = useState<IUser>({
  //   name: "",
  //   email: "",
  //   phone: "",
  //   role: "staff",
  //   status: "active",
  //   employee_id: "",
  //   permissions: [],
  // });
  // const [tempPassword, setTempPassword] = useState("");
  // const [filters, setFilters] = useState({
  //   searchTerm: "",
  //   roleFilter: "",
  //   statusFilter: "",
  // });

  // const [users, setUsers] = useState<IUser[]>([
  // ]);

  // const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  // const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // const [userToDelete, setUserToDelete] = useState<IUser | undefined>(undefined);

  // const generatePassword = () => {
  //   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  //   let result = "";
  //   for (let i = 0; i < 12; i++) {
  //     result += chars.charAt(Math.floor(Math.random() * chars.length));
  //   }
  //   setTempPassword(result);
  // };

  // const handleFormChange = (field: keyof IUser, value: string) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));

  //   if (field === "role") {
  //     setFormData((prev) => ({
  //       ...prev,
  //       permissions: ROLE_PERMISSIONS[value as keyof typeof ROLE_PERMISSIONS] || [],
  //     }));
  //   }
  // };

  // const handlePermissionChange = (permissionId: string, checked: boolean) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     permissions: checked
  //       ? [...(prev.permissions || []), permissionId]
  //       : (prev.permissions || []).filter(id => id !== permissionId),
  //   }));
  // };

  // const resetForm = () => {
  //   setFormData({
  //     name: "",
  //     email: "",
  //     phone: "",
  //     role: "staff",
  //     status: "active",
  //     employee_id: "",
  //     permissions: ROLE_PERMISSIONS.staff,
  //   });
  //   setTempPassword("");
  // };

  // const handleEditClick = (user: IUser) => {
  //   setFormData({
  //     id: user.id,
  //     name: user.name,
  //     email: user.email,
  //     phone: user.phone,
  //     role: user.role,
  //     status: user.status,
  //     employee_id: user.employee_id,
  //     permissions: user.permissions || [],
  //   });
  //   setIsAddDialogOpen(true);
  // };

  // const handlePermissionClick = (user: IUser) => {
  //   setSelectedUser(user);
  //   setFormData({
  //     ...user,
  //     permissions: user.permissions || [],
  //   });
  //   setIsPermissionDialogOpen(true);
  // };

  // const handleCreate = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);

  //   try {
  //     const newUser: IUser = {
  //       ...formData,
  //       id: users.length + 1,
  //       created_at: new Date().toISOString().split('T')[0],
  //       last_login: "",
  //     };

  //     setUsers(prev => [...prev, newUser]);
      
  //     setTimeout(() => {
  //       alert(`User berhasil ditambahkan!\n\nEmail: ${formData.email}\nPassword Sementara: ${tempPassword}\n\nSilakan berikan informasi ini kepada user untuk login pertama kali.`);
  //       setIsAddDialogOpen(false);
  //       resetForm();
  //       setIsSubmitting(false);
  //     }, 1000);
  //   } catch (error) {
  //     console.error("Failed to create user:", error);
  //     setIsSubmitting(false);
  //   }
  // };

  // const handleUpdate = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);

  //   try {
  //     setUsers(prev => 
  //       prev.map(user => 
  //         user.id === formData.id 
  //           ? { ...user, ...formData }
  //           : user
  //       )
  //     );

  //     setTimeout(() => {
  //       alert("User berhasil diperbarui!");
  //       setIsAddDialogOpen(false);
  //       resetForm();
  //       setIsSubmitting(false);
  //     }, 1000);
  //   } catch (error) {
  //     console.error("Failed to update user:", error);
  //     setIsSubmitting(false);
  //   }
  // };

  // const handleDeleteClick = (user: IUser) => {
  //   setUserToDelete(user);
  //   setIsDeleteModalOpen(true);
  // };

  // const handleConfirmDelete = () => {
  //   if (userToDelete) {
  //     setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
  //     setIsDeleteModalOpen(false);
  //     setUserToDelete(undefined);
  //     alert("User berhasil dihapus!");
  //   }
  // };

  // const handleRowsPerPageChange = (value: string) => {
  //   setRowsPerPage(value);
  //   setCurrentPage(1);
  // };

  // const clearFilters = () => {
  //   setFilters({
  //     searchTerm: "",
  //     roleFilter: "",
  //     statusFilter: "",
  //   });
  // };

  // const formatDisplayDate = (dateString: string | null) => {
  //   if (!dateString) return "Belum pernah login";
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString("id-ID", {
  //     day: "2-digit",
  //     month: "2-digit",
  //     year: "numeric",
  //   });
  // };

  // const hasActiveFilters = Object.values(filters).some(
  //   (filter) => filter !== ""
  // );

  // const filteredData = useMemo(() => {
  //   return users.filter((user) => {
  //     if (
  //       filters.searchTerm &&
  //       !user.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
  //       !user.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
  //       !user.employee_id.toLowerCase().includes(filters.searchTerm.toLowerCase())
  //     ) {
  //       return false;
  //     }

  //     if (filters.roleFilter && user.role !== filters.roleFilter) {
  //       return false;
  //     }

  //     if (filters.statusFilter && user.status !== filters.statusFilter) {
  //       return false;
  //     }

  //     return true;
  //   });
  // }, [filters, users]);

  // const totalPages = Math.ceil(filteredData.length / parseInt(rowsPerPage));
  // const startIndex = (currentPage - 1) * parseInt(rowsPerPage);
  // const endIndex = startIndex + parseInt(rowsPerPage);
  // const paginatedData = filteredData.slice(startIndex, endIndex);

  // const handleSearchChange = useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement>) => {
  //     setFilters((prev) => ({
  //       ...prev,
  //       searchTerm: e.target.value,
  //     }));
  //     setCurrentPage(1);
  //   },
  //   []
  // );

  // const handleRoleFilterChange = useCallback((value: string) => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     roleFilter: value === "all" ? "" : value,
  //   }));
  //   setCurrentPage(1);
  // }, []);

  // const getRoleBadgeColor = (role: string) => {
  //   switch (role) {
  //     case "admin":
  //       return "bg-purple-100 text-purple-800";
  //     case "teacher":
  //       return "bg-blue-100 text-blue-800";
  //     case "staff":
  //       return "bg-green-100 text-green-800";
  //     case "operator":
  //       return "bg-orange-100 text-orange-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };

  // const getRoleDisplayName = (role: string) => {
  //   const roleNames = {
  //     admin: "Administrator",
  //     teacher: "Guru",
  //     staff: "Staff",
  //     operator: "Operator",
  //   };
  //   return roleNames[role as keyof typeof roleNames] || role;
  // };

  // // Group permissions by category
  // const groupedPermissions = useMemo(() => {
  //   const groups: { [key: string]: IPermission[] } = {};
  //   AVAILABLE_PERMISSIONS.forEach(permission => {
  //     if (!groups[permission.category]) {
  //       groups[permission.category] = [];
  //     }
  //     groups[permission.category].push(permission);
  //   });
  //   return groups;
  // }, []);

  // const exportUsers = () => {
  //   const csvContent = "data:text/csv;charset=utf-8," + 
  //     "Name,Email,Phone,Role,Employee ID,Status,Created At,Last Login\n" +
  //     users.map(user => 
  //       `"${user.name}","${user.email}","${user.phone}","${getRoleDisplayName(user.role)}","${user.employee_id}","${user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}","${formatDisplayDate(user.created_at || '')}","${formatDisplayDate(user.last_login || '')}"`
  //     ).join("\n");

  //   const encodedUri = encodeURI(csvContent);
  //   const link = document.createElement("a");
  //   link.setAttribute("href", encodedUri);
  //   link.setAttribute("download", "users_data.csv");
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  // if (isLoading) {
  //   return (
  //       <div className="flex items-center justify-center h-full">
  //           <div className="w-14 h-14 border-4 border-gray-300 border-t-emerald-500 rounded-full animate-spin"></div>
  //       </div>
  //   );
  // }

  // return (
  //   <div className="space-y-6 min-h-screen md:max-w-screen-xl mx-auto text-sm sm:text-base md:text-base">
  //     {/* Header */}
  //     <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 sm:p-6 shadow-md mb-6">
  //       <div className="flex items-center mb-2">
  //         <div className="bg-green-600/40 p-2 rounded-lg mr-3">
  //           <Users className="h-6 w-6 text-white" />
  //         </div>
  //         <h1 className="text-2xl sm:text-3xl font-bold text-black leading-tight">
  //           Manajemen Pengguna
  //         </h1>
  //       </div>
  //       <p className="text-gray-600 max-w-3xl leading-relaxed">
  //         Kelola pengguna sistem, atur peran dan hak akses untuk guru dan staff sekolah.
  //       </p>
  //     </div>

  //     <div className="bg-white rounded-xl overflow-hidden shadow-sm">
  //       <div className="px-4 sm:px-6 pt-4 pb-4 border-b-2 border-green-500">
  //         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
  //           <div className="flex items-center gap-2">
  //             <Users className="h-5 w-5 text-green-500" />
  //             <h2 className="text-md font-bold text-gray-900">
  //               Daftar Pengguna Sistem
  //             </h2>
  //           </div>
  //           <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
  //             <Button
  //               onClick={exportUsers}
  //               variant="outline"
  //               className="text-green-600 hover:text-white hover:bg-green-600 border-2 border-green-600 transition-all duration-300"
  //             >
  //               <Download size={16} className="mr-2" />
  //               Export Data
  //             </Button>
              
  //             <Select
  //               value={filters.roleFilter || "all"}
  //               onValueChange={handleRoleFilterChange}
  //             >
  //               <SelectTrigger className="w-32">
  //                 <SelectValue placeholder="Role" />
  //               </SelectTrigger>
  //               <SelectContent>
  //                 <SelectItem value="all">Semua Role</SelectItem>
  //                 <SelectItem value="admin">Administrator</SelectItem>
  //                 <SelectItem value="teacher">Guru</SelectItem>
  //                 <SelectItem value="staff">Staff</SelectItem>
  //                 <SelectItem value="operator">Operator</SelectItem>
  //               </SelectContent>
  //             </Select>
              
  //             {hasActiveFilters && (
  //               <Button
  //                 variant="outline"
  //                 size="sm"
  //                 onClick={clearFilters}
  //                 className="text-gray-600 hover:text-gray-800 h-8"
  //               >
  //                 <X className="h-3 w-3 mr-1" />
  //                 Clear
  //               </Button>
  //             )}
              
  //             <div className="relative w-full sm:w-64">
  //               <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
  //                 <Search className="h-4 w-4 text-gray-400" />
  //               </div>
  //               <Input
  //                 type="text"
  //                 className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
  //                 placeholder="Cari nama, email, atau ID..."
  //                 value={filters.searchTerm}
  //                 onChange={handleSearchChange}
  //               />
  //             </div>
              
  //             <Button
  //               onClick={() => {
  //                 resetForm();
  //                 generatePassword();
  //                 setIsAddDialogOpen(true);
  //               }}
  //               className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
  //             >
  //               <Plus className="h-4 w-4 mr-2" />
  //               Tambah Pengguna
  //             </Button>
  //           </div>
  //         </div>
  //       </div>

  //       <div className="overflow-x-auto pt-3 relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
  //         {/* Desktop Table */}
  //         <div className="hidden lg:block">
  //           <Table>
  //             <TableHeader>
  //               <TableRow className="bg-gray-50 hover:bg-gray-50">
  //                 <TableHead className="text-center font-medium text-black">No</TableHead>
  //                 <TableHead className="text-left font-medium text-black">Pengguna</TableHead>
  //                 <TableHead className="text-left font-medium text-black">Email & Telepon</TableHead>
  //                 <TableHead className="text-center font-medium text-black">Role</TableHead>
  //                 <TableHead className="text-center font-medium text-black">Status</TableHead>
  //                 <TableHead className="text-center font-medium text-black">Last Login</TableHead>
  //                 <TableHead className="text-center font-medium text-black">Aksi</TableHead>
  //               </TableRow>
  //             </TableHeader>
  //             <TableBody>
  //               {paginatedData.length > 0 ? (
  //                 paginatedData.map((user, index) => (
  //                   <TableRow key={user.id} className="border-b hover:bg-gray-50">
  //                     <TableCell className="text-center px-6 font-normal">
  //                       {startIndex + index + 1}
  //                     </TableCell>
  //                     <TableCell className="text-left font-normal">
  //                       <div>
  //                         <div className="font-medium text-gray-900">{user.name}</div>
  //                         <div className="text-sm text-gray-500">NIP: {user.employee_id}</div>
  //                       </div>
  //                     </TableCell>
  //                     <TableCell className="text-left font-normal">
  //                       <div className="space-y-1">
  //                         <div className="flex items-center gap-2 text-sm">
  //                           <Mail className="h-3 w-3 text-gray-400" />
  //                           <span className="truncate max-w-48">{user.email}</span>
  //                         </div>
  //                         <div className="flex items-center gap-2 text-sm text-gray-600">
  //                           <Phone className="h-3 w-3 text-gray-400" />
  //                           <span>{user.phone}</span>
  //                         </div>
  //                       </div>
  //                     </TableCell>
  //                     <TableCell className="text-center font-normal">
  //                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
  //                         {getRoleDisplayName(user.role)}
  //                       </span>
  //                     </TableCell>
  //                     <TableCell className="text-center font-normal">
  //                       <span
  //                         className={`px-3 py-1 rounded-full text-xs font-medium ${
  //                           user.status === "active"
  //                             ? "bg-green-100 text-green-600"
  //                             : "bg-red-100 text-red-600"
  //                         }`}
  //                       >
  //                         {user.status === "active" ? "Aktif" : "Tidak Aktif"}
  //                       </span>
  //                     </TableCell>
  //                     <TableCell className="text-center font-normal text-sm">
  //                       {formatDisplayDate(user.last_login)}
  //                     </TableCell>
  //                     <TableCell className="text-center font-normal">
  //                       <div className="flex justify-center gap-1">
  //                         <Button
  //                           variant="outline"
  //                           size="icon"
  //                           onClick={() => handlePermissionClick(user)}
  //                           className="text-purple-500 hover:text-purple-600 h-8 w-8"
  //                           title="Manage Permissions"
  //                         >
  //                           <Shield className="h-3 w-3" />
  //                         </Button>
  //                         <Button
  //                           variant="outline"
  //                           size="icon"
  //                           onClick={() => handleEditClick(user)}
  //                           className="text-green-500 hover:text-green-600 h-8 w-8"
  //                           title="Edit User"
  //                         >
  //                           <SquarePen className="h-3 w-3" />
  //                         </Button>
  //                         <Button
  //                           variant="outline"
  //                           size="icon"
  //                           onClick={() => handleDeleteClick(user)}
  //                           className="text-red-500 hover:text-red-600 h-8 w-8"
  //                           title="Delete User"
  //                         >
  //                           <Trash2 className="h-3 w-3" />
  //                         </Button>
  //                       </div>
  //                     </TableCell>
  //                   </TableRow>
  //                 ))
  //               ) : (
  //                 <TableRow>
  //                   <TableCell colSpan={7} className="text-center py-12 px-4">
  //                     <div className="flex flex-col items-center gap-2 text-gray-500">
  //                       <Users className="h-8 w-8 text-gray-300" />
  //                       <p>Tidak ada pengguna ditemukan</p>
  //                     </div>
  //                   </TableCell>
  //                 </TableRow>
  //               )}
  //             </TableBody>
  //           </Table>
  //         </div>

  //         {/* Mobile Card List */}
  //         <div className="lg:hidden space-y-4 px-4">
  //           {paginatedData.length > 0 ? (
  //             paginatedData.map((user, index) => (
  //               <div
  //                 key={user.id}
  //                 className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
  //               >
  //                 <div className="flex justify-between items-start mb-3">
  //                   <div className="flex-1">
  //                     <div className="flex items-center gap-2 mb-2 flex-wrap">
  //                       <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
  //                         #{startIndex + index + 1}
  //                       </span>
  //                       <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(user.role)}`}>
  //                         {getRoleDisplayName(user.role)}
  //                       </span>
  //                       <span
  //                         className={`text-xs px-2 py-1 rounded-full ${
  //                           user.status === "active"
  //                             ? "bg-green-100 text-green-600"
  //                             : "bg-red-100 text-red-600"
  //                         }`}
  //                       >
  //                         {user.status === "active" ? "Aktif" : "Tidak Aktif"}
  //                       </span>
  //                     </div>
  //                     <div className="text-lg font-semibold text-gray-900 mb-2">
  //                       {user.name}
  //                     </div>
  //                     <div className="text-sm text-gray-500 space-y-1">
  //                       <div>ID: {user.employee_id}</div>
  //                       <div className="flex items-center gap-1">
  //                         <Mail className="h-3 w-3" />
  //                         <span className="truncate">{user.email}</span>
  //                       </div>
  //                       <div className="flex items-center gap-1">
  //                         <Phone className="h-3 w-3" />
  //                         {user.phone}
  //                       </div>
  //                       <div>
  //                         <span className="font-medium">Last Login:</span> {formatDisplayDate(user.last_login)}
  //                       </div>
  //                     </div>
  //                   </div>
  //                   <div className="flex gap-2 ml-2">
  //                     <Button
  //                       variant="outline"
  //                       size="icon"
  //                       onClick={() => handlePermissionClick(user)}
  //                       className="text-purple-500 hover:text-purple-600 h-8 w-8"
  //                     >
  //                       <Shield className="h-3 w-3" />
  //                     </Button>
  //                     <Button
  //                       variant="outline"
  //                       size="icon"
  //                       onClick={() => handleEditClick(user)}
  //                       className="text-green-500 hover:text-green-600 h-8 w-8"
  //                     >
  //                       <SquarePen className="h-3 w-3" />
  //                     </Button>
  //                     <Button
  //                       variant="outline"
  //                       size="icon"
  //                       onClick={() => handleDeleteClick(user)}
  //                       className="text-red-500 hover:text-red-600 h-8 w-8"
  //                     >
  //                       <Trash2 className="h-3 w-3" />
  //                     </Button>
  //                   </div>
  //                 </div>
  //               </div>
  //             ))
  //           ) : (
  //             <div className="text-center py-12 text-gray-500">
  //               <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
  //               <p>Tidak ada pengguna ditemukan</p>
  //             </div>
  //           )}
  //         </div>
  //       </div>

  //       {/* Pagination */}
  //       <div className="px-4 sm:px-6 pt-4 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center border-t gap-4">
  //         <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
  //           <div className="text-sm text-gray-500 text-center sm:text-left">
  //             Menampilkan {startIndex + 1} -{" "}
  //             {Math.min(endIndex, filteredData.length)} dari{" "}
  //             {filteredData.length} data
  //           </div>
  //           <div className="flex items-center justify-center sm:justify-start space-x-2">
  //             <span className="text-sm text-gray-600">Rows:</span>
  //             <Select
  //               value={rowsPerPage}
  //               onValueChange={handleRowsPerPageChange}
  //             >
  //               <SelectTrigger className="w-16 h-8 border-gray-200 focus:ring-green-400 rounded-lg">
  //                 <SelectValue placeholder="10" />
  //               </SelectTrigger>
  //               <SelectContent className="w-16 min-w-[4rem]">
  //                 <SelectItem value="5">5</SelectItem>
  //                 <SelectItem value="10">10</SelectItem>
  //                 <SelectItem value="20">20</SelectItem>
  //               </SelectContent>
  //             </Select>
  //           </div>
  //         </div>

  //         <div className="flex items-center justify-center sm:justify-end space-x-2">
  //           <Button
  //             variant="outline"
  //             size="icon"
  //             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
  //             disabled={currentPage === 1}
  //           >
  //             <ChevronLeft className="h-4 w-4" />
  //           </Button>

  //           <div className="text-sm text-gray-600">
  //             Page {currentPage} of {totalPages}
  //           </div>

  //           <Button
  //             variant="outline"
  //             size="icon"
  //             onClick={() =>
  //               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  //             }
  //             disabled={currentPage >= totalPages}
  //           >
  //             <ChevronRight className="h-4 w-4" />
  //           </Button>
  //         </div>
  //       </div>
  //     </div>

  //     {/* Add/Edit User Dialog */}
  //     <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
  //       <DialogContent className="max-w-full sm:max-w-3xl lg:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
  //         <DialogHeader>
  //           <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
  //             <Users className="h-5 w-5 text-green-600" />
  //             {formData.id ? "Edit Pengguna" : "Tambah Pengguna Baru"}
  //           </DialogTitle>
  //           <DialogDescription>
  //             {formData.id
  //               ? "Edit informasi pengguna dan atur hak akses."
  //               : "Isi form di bawah ini untuk menambahkan pengguna baru ke dalam sistem."}
  //           </DialogDescription>
  //         </DialogHeader>

  //         <form
  //           onSubmit={formData.id ? handleUpdate : handleCreate}
  //           className="space-y-6"
  //         >
  //           <div className="grid grid-cols-1 gap-6">
  //             {/* Basic Information */}
  //             <div className="space-y-4">
  //               <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
  //                 Informasi Dasar
  //               </h3>
                
  //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  //                 {/* Full Name */}
  //                 <div className="space-y-2">
  //                   <Label htmlFor="name" className="text-sm font-medium text-gray-700">
  //                     Nama Lengkap <span className="text-red-500">*</span>
  //                   </Label>
  //                   <Input
  //                     id="name"
  //                     type="text"
  //                     placeholder="Masukkan nama lengkap"
  //                     value={formData.name}
  //                     onChange={(e) => handleFormChange("name", e.target.value)}
  //                     className="w-full"
  //                     required
  //                   />
  //                 </div>

  //                 {/* Employee ID */}
  //                 <div className="space-y-2">
  //                   <Label htmlFor="employee_id" className="text-sm font-medium text-gray-700">
  //                     NIP <span className="text-red-500">*</span>
  //                   </Label>
  //                   <Input
  //                     id="employee_id"
  //                     type="text"
  //                     placeholder="Contoh: EMP001"
  //                     value={formData.employee_id}
  //                     onChange={(e) => handleFormChange("employee_id", e.target.value)}
  //                     className="w-full"
  //                     required
  //                   />
  //                 </div>

  //                 {/* Email */}
  //                 <div className="space-y-2">
  //                   <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-1">
  //                     <Mail className="w-4 h-4" /> Email <span className="text-red-500">*</span>
  //                   </Label>
  //                   <Input
  //                     id="email"
  //                     type="email"
  //                     placeholder="nama@sekolah.edu"
  //                     value={formData.email}
  //                     onChange={(e) => handleFormChange("email", e.target.value)}
  //                     className="w-full"
  //                     required
  //                   />
  //                 </div>

  //                 {/* Phone */}
  //                 <div className="space-y-2">
  //                   <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-1">
  //                     <Phone className="w-4 h-4" /> No. Telepon <span className="text-red-500">*</span>
  //                   </Label>
  //                   <Input
  //                     id="phone"
  //                     type="tel"
  //                     placeholder="+62 812-3456-7890"
  //                     value={formData.phone}
  //                     onChange={(e) => handleFormChange("phone", e.target.value)}
  //                     className="w-full"
  //                     required
  //                   />
  //                 </div>

  //                 {/* Role */}
  //                 <div className="space-y-2 sm:col-span-2">
  //                   <Label htmlFor="role" className="text-sm font-medium text-gray-700 flex items-center gap-1">
  //                     <Shield className="w-4 h-4" /> Role <span className="text-red-500">*</span>
  //                   </Label>
  //                   <Select
  //                     value={formData.role}
  //                     onValueChange={(value) => handleFormChange("role", value)}
  //                   >
  //                     <SelectTrigger className="w-full">
  //                       <SelectValue placeholder="Pilih role pengguna" />
  //                     </SelectTrigger>
  //                     <SelectContent>
  //                       <SelectItem value="admin">Administrator - Akses penuh sistem</SelectItem>
  //                       <SelectItem value="teacher">Guru - Akses akademik dan nilai</SelectItem>
  //                       <SelectItem value="staff">Staff - Akses administrasi siswa</SelectItem>
  //                       <SelectItem value="operator">Operator - Akses terbatas data master</SelectItem>
  //                     </SelectContent>
  //                   </Select>
  //                 </div>
  //               </div>
  //             </div>

  //             {/* Password Section (Only for new users) */}
  //             {!formData.id && (
  //               <div className="space-y-4">
  //                 <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
  //                   Password Sementara
  //                 </h3>
  //                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
  //                   <div className="flex items-center gap-2 mb-2">
  //                     <Key className="h-4 w-4 text-yellow-600" />
  //                     <span className="text-sm font-medium text-yellow-800">
  //                       Password akan digenerate otomatis
  //                     </span>
  //                   </div>
  //                   <div className="flex items-center gap-2">
  //                     <Input
  //                       type={showPassword ? "text" : "password"}
  //                       value={tempPassword}
  //                       readOnly
  //                       className="bg-white"
  //                     />
  //                     <Button
  //                       type="button"
  //                       variant="outline"
  //                       size="icon"
  //                       onClick={() => setShowPassword(!showPassword)}
  //                     >
  //                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  //                     </Button>
  //                     <Button
  //                       type="button"
  //                       variant="outline"
  //                       onClick={generatePassword}
  //                       className="whitespace-nowrap"
  //                     >
  //                       Generate Ulang
  //                     </Button>
  //                   </div>
  //                   <p className="text-xs text-yellow-700 mt-2">
  //                     Password ini akan diberikan kepada pengguna untuk login pertama kali. 
  //                     Pengguna disarankan untuk mengubah password setelah login.
  //                   </p>
  //                 </div>
  //               </div>
  //             )}

  //             {/* Permissions Preview */}
  //             <div className="space-y-4">
  //               <div className="flex items-center justify-between">
  //                 <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex-1">
  //                   Hak Akses ({formData.role ? getRoleDisplayName(formData.role) : 'Belum dipilih'})
  //                 </h3>
  //                 <Button
  //                   type="button"
  //                   variant="outline"
  //                   onClick={() => {
  //                     setSelectedUser(formData);
  //                     setIsPermissionDialogOpen(true);
  //                   }}
  //                   className="ml-4"
  //                   size="sm"
  //                 >
  //                   <Settings className="h-4 w-4 mr-2" />
  //                   Kustomisasi
  //                 </Button>
  //               </div>
                
  //               <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
  //                 {formData.permissions && formData.permissions.length > 0 ? (
  //                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
  //                     {Object.entries(groupedPermissions).map(([category, permissions]) => {
  //                       const categoryPermissions = permissions.filter(p => 
  //                         formData.permissions?.includes(p.id)
  //                       );
                        
  //                       if (categoryPermissions.length === 0) return null;
                        
  //                       return (
  //                         <div key={category} className="space-y-2">
  //                           <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-300 pb-1">
  //                             {category}
  //                           </h4>
  //                           {categoryPermissions.map(permission => (
  //                             <div key={permission.id} className="flex items-center gap-2 text-xs">
  //                               <span className="text-gray-700">{permission.name}</span>
  //                             </div>
  //                           ))}
  //                         </div>
  //                       );
  //                     })}
  //                   </div>
  //                 ) : (
  //                   <p className="text-gray-500 text-sm">Pilih role untuk melihat hak akses yang akan diberikan</p>
  //                 )}
  //               </div>
  //             </div>
  //           </div>

  //           <DialogFooter className="flex gap-3 pt-6">
  //             <Button
  //               type="button"
  //               variant="outline"
  //               onClick={() => {
  //                 setIsAddDialogOpen(false);
  //                 resetForm();
  //               }}
  //               disabled={isSubmitting}
  //             >
  //               Batal
  //             </Button>
  //             <Button
  //               type="submit"
  //               className="bg-green-600 hover:bg-green-700 text-white"
  //               disabled={isSubmitting}
  //             >
  //               {isSubmitting ? (
  //                 <>
  //                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
  //                   Menyimpan...
  //                 </>
  //               ) : (
  //                 <>
  //                   <Plus className="h-4 w-4 mr-2" />
  //                   {formData.id ? "Perbarui Pengguna" : "Tambah Pengguna"}
  //                 </>
  //               )}
  //             </Button>
  //           </DialogFooter>
  //         </form>
  //       </DialogContent>
  //     </Dialog>

  //     {/* Permission Management Dialog */}
  //     <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
  //       <DialogContent className="max-w-full sm:max-w-5xl w-full max-h-[90vh] overflow-y-auto">
  //         <DialogHeader>
  //           <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
  //             <Shield className="h-5 w-5 text-purple-600" />
  //             Kelola Hak Akses
  //             {selectedUser && ` - ${selectedUser.name}`}
  //           </DialogTitle>
  //           <DialogDescription>
  //             Pilih hak akses yang sesuai untuk pengguna ini. Hak akses menentukan fitur dan data mana yang dapat diakses pengguna.
  //           </DialogDescription>
  //         </DialogHeader>

  //         <div className="space-y-6">
  //           {Object.entries(groupedPermissions).map(([category, permissions]) => (
  //             <div key={category} className="space-y-4">
  //               <div className="flex items-center justify-between">
  //                 <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex-1">
  //                   {category}
  //                 </h3>
  //                 <div className="flex items-center gap-2 ml-4">
  //                   <Button
  //                     type="button"
  //                     variant="outline"
  //                     size="sm"
  //                     onClick={() => {
  //                       permissions.forEach(p => {
  //                         if (!(formData.permissions || []).includes(p.id)) {
  //                           handlePermissionChange(p.id, true);
  //                         }
  //                       });
  //                     }}
  //                     className="text-xs"
  //                   >
  //                     Pilih Semua
  //                   </Button>
  //                   <Button
  //                     type="button"
  //                     variant="outline"
  //                     size="sm"
  //                     onClick={() => {
  //                       permissions.forEach(p => {
  //                         if ((formData.permissions || []).includes(p.id)) {
  //                           handlePermissionChange(p.id, false);
  //                         }
  //                       });
  //                     }}
  //                     className="text-xs"
  //                   >
  //                     Hapus Semua
  //                   </Button>
  //                 </div>
  //               </div>
  //               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
  //                 {permissions.map(permission => {
  //                   const isChecked = (formData.permissions || []).includes(permission.id);
  //                   return (
  //                     <div 
  //                       key={permission.id} 
  //                       className={`flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
  //                         isChecked ? 'border-green-200 bg-green-50' : 'border-gray-200'
  //                       }`}
  //                     >
  //                       <Checkbox
  //                         id={permission.id}
  //                         checked={isChecked}
  //                         onCheckedChange={(checked) => 
  //                           handlePermissionChange(permission.id, checked === true)
  //                         }
  //                         className="mt-1"
  //                       />
  //                       <div className="flex-1">
  //                         <Label 
  //                           htmlFor={permission.id}
  //                           className="text-sm font-medium text-gray-900 cursor-pointer flex items-center gap-2"
  //                         >
  //                           {permission.name}
  //                         </Label>
  //                         <p className="text-xs text-gray-500 mt-1">
  //                           {permission.description}
  //                         </p>
  //                       </div>
  //                     </div>
  //                   );
  //                 })}
  //               </div>
  //             </div>
  //           ))}
  //         </div>

  //         <DialogFooter className="flex gap-3 pt-6">
  //           <Button
  //             type="button"
  //             variant="outline"
  //             onClick={() => setIsPermissionDialogOpen(false)}
  //           >
  //             Batal
  //           </Button>
  //           <Button
  //             type="button"
  //             className="bg-purple-600 hover:bg-purple-700 text-white"
  //             onClick={() => {
  //               if (selectedUser?.id) {
  //                 // Update existing user
  //                 setUsers(prev => 
  //                   prev.map(user => 
  //                     user.id === selectedUser.id 
  //                       ? { ...user, permissions: formData.permissions }
  //                       : user
  //                   )
  //                 );
  //               }
  //               setIsPermissionDialogOpen(false);
  //             }}
  //           >
  //             <Shield className="h-4 w-4 mr-2" />
  //             Simpan Perubahan
  //           </Button>
  //         </DialogFooter>
  //       </DialogContent>
  //     </Dialog>

  //     {/* Delete Confirmation Modal */}
  //     <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
  //       <DialogContent className="max-w-md">
  //         <DialogHeader>
  //           <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
  //             <Trash2 className="h-5 w-5" />
  //             Hapus Pengguna?
  //           </DialogTitle>
  //           <DialogDescription className="text-gray-600">
  //             Apakah Anda yakin ingin menghapus pengguna{" "}
  //             <span className="font-semibold">{userToDelete?.name}</span>?
  //             <br />
  //             <br />
  //             Pengguna akan kehilangan akses ke sistem dan semua data terkait akan dihapus. 
  //             Tindakan ini tidak dapat dibatalkan.
  //           </DialogDescription>
  //         </DialogHeader>
  //         <DialogFooter className="flex gap-3">
  //           <Button
  //             variant="outline"
  //             onClick={() => setIsDeleteModalOpen(false)}
  //           >
  //             Batal
  //           </Button>
  //           <Button
  //             variant="destructive"
  //             onClick={handleConfirmDelete}
  //             className="bg-red-600 hover:bg-red-700"
  //           >
  //             <Trash2 className="h-4 w-4 mr-2" />
  //             Hapus Pengguna
  //           </Button>
  //         </DialogFooter>
  //       </DialogContent>
  //     </Dialog>
  //   </div>
  // );

  return (
    <></>
  )
};

export default ViewManageUser;