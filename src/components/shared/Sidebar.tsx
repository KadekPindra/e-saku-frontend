import { useCallback, useEffect, useState } from "react";
import {
  Home,
  DiamondMinusIcon,
  User,
  FileText,
  History,
  LogOut,
  Users,
  CircleHelp,
  FolderKanban,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import skensalogo from "@/assets/skensa.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "@/utils/context/sidebarContext";
import { Sheet, SheetContent } from "../ui/sheet";
import { useLogout } from "@/config/Api/useAuth";
import ConfirmationModal from "../ui/confirmation";
import toast from "react-hot-toast";

const Sidebar = ({ isMobile }: { isMobile?: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeItem = location.pathname;
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar();

  const { logout } = useLogout();
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const role = localStorage.getItem("role") || "student";

  const isMobileScreen = windowWidth < 835;

  const confirmLogout = async () => {
    setLogoutModalOpen(false);
    try {
      await logout();
      toast.success("Logout berhasil");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Logout gagal");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCloseSidebar = useCallback(
    (e: React.MouseEvent) => {
      if ((isMobile || isMobileScreen) && isOpen) {
        e.stopPropagation();
        toggleSidebar();
      }
    },
    [isMobile, isMobileScreen, isOpen, toggleSidebar]
  );

  const handleMenuItemClick = useCallback(() => {
    if (isMobile || isMobileScreen) {
      closeSidebar();
    }
  }, [isMobile, isMobileScreen, closeSidebar]);

  const toggleDropdown = useCallback(
    (label: string) => {
      setOpenDropdown(openDropdown === label ? null : label);
    },
    [openDropdown]
  );

  // Role-based menu items
  const rolePlatformItems: Record<string, any[]> = {
    teacher: [
      { label: "Dashboard", icon: Home, path: "/" },
      { label: "Student", icon: Users, path: "/student" },
      { label: "E-saku Form", icon: FileText, path: "/esakuform" },
      { label: "History", icon: History, path: "/history" },
      {
        label: "Manage",
        icon: FolderKanban,
        isDropdown: true,
        subItems: [{ label: "Rules", icon: DiamondMinusIcon, path: "/rules" }],
      },
    ],
    master: [
      { label: "Dashboard", icon: Home, path: "/" },
      { label: "Student", icon: Users, path: "/student" },
      { label: "E-saku Form", icon: FileText, path: "/esakuform" },
      { label: "History", icon: History, path: "/history" },
      {
        label: "Manage",
        icon: FolderKanban,
        isDropdown: true,
        subItems: [
          { label: "Rules", icon: DiamondMinusIcon, path: "/manageRules" },
          { label: "Activity", icon: FolderKanban, path: "/manageactivity" },
          { label: "Teacher", icon: FolderKanban, path: "/manageteacher" },
          { label: "Users", icon: Users, path: "/manageuser" },
          { label: "Wali Kelas", icon: User, path: "/managehometeacher"}
        ],
      },
    ],
    student: [
      {
        label: "My Accomplishments",
        icon: Users,
        path: `/studentbio/accomplishments/${localStorage.getItem(
          "student_id"
        )}`,
      },
      {
        label: "My Violations",
        icon: Users,
        path: `/studentbio/violations/${localStorage.getItem("student_id")}`,
      },
      {
        label: "Extracurricular",
        icon: Users,
        path: `/student/extra`,
      },
      { label: "Rules", icon: DiamondMinusIcon, path: "/rules" },
    ],
    trainer: [
      {
        label: "Manage Extracurricular",
        icon: FolderKanban,
        path: "/manageextracurricular",
      },
    ],
  };

  // Combine common items with role-specific items
  const platformItems = [...(rolePlatformItems[role] || [])];

  // Account items (common for all)
  const accountItems = [{ label: "Help", icon: CircleHelp, path: "/help" }];

  // Profile items based on role
  const roleProfileItems: Record<string, any[]> = {
    teacher: [{ label: "Profile", icon: User, path: "/profileteacher" }],
    master: [{ label: "Profile", icon: User, path: "/profileteacher" }],
    student: [{ label: "Profile", icon: User, path: "/profilestudent" }],
    trainer: [{ label: "Profile", icon: User, path: "/profiletrainer" }],
  };

  const profileItems = roleProfileItems[role] || [];

  const isActivePath = (currentPath: string, itemPath: string): boolean => {
    const studentId = localStorage.getItem("student_id");
    const matchPatterns: Record<string, RegExp[]> = {
      "/student": [
        /^\/student$/,
        /^\/student\/class(\/.*)?$/,
        /^\/studentbio(\/.*)?$/,
      ],
      "/": [/^\/$/],
      "/esakuform": [/^\/esakuform$/],
      "/history": [/^\/history$/],
      "/rules": [/^\/rules$/],
      "/profilestudent": [/^\/profilestudent$/],
      "/profileteacher": [/^\/profileteacher$/],
      "/profiletrainer": [/^\/profiletrainer$/],
      [`/studentbio/accomplishments/${studentId}`]: [
        new RegExp(`^/studentbio/accomplishments/${studentId}$`),
        new RegExp(`^/studentbio/accomplishments/${studentId}/.*$`),
      ],
      [`/studentbio/violations/${studentId}`]: [
        new RegExp(`^/studentbio/violations/${studentId}$`),
        new RegExp(`^/studentbio/violations/${studentId}/.*$`),
      ],
      "/manageactivity": [/^\/manageactivity$/],
      "/manageteacher": [/^\/manageteacher$/],
      "/manageuser": [/^\/manageuser$/],
    };

    const patterns = matchPatterns[itemPath];
    if (!patterns) return currentPath === itemPath;

    return patterns.some((regex) => regex.test(currentPath));
  };

  const isDropdownActive = (item: any): boolean => {
    if (!item.isDropdown || !item.subItems) return false;
    return item.subItems.some((subItem: any) =>
      isActivePath(activeItem, subItem.path)
    );
  };

  const SidebarContent = (
    <motion.div
      initial={{ x: -256 }}
      animate={{
        x: 0,
        transition: { type: "spring", stiffness: 250, damping: 25 },
      }}
      exit={{
        x: -256,
        transition: { type: "spring", stiffness: 200, damping: 20 },
      }}
      className="fixed top-0 left-0 h-full bg-white dark:bg-background shadow-lg z-50 flex flex-col overflow-hidden"
    >
      <div className="flex items-center px-4 h-[4.2rem] space-x-3 bg-gray-100">
        <img
          src={skensalogo}
          alt="Logo"
          className="w-10 h-10 rounded-md flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="text-md font-bold text-gray-800 truncate">
            E-Saku Peserta Didik
          </div>
          <div className="text-xs text-gray-500 truncate">
            SMK Negeri 1 Denpasar
          </div>
        </div>
      </div>
      <div className="border-t-2 border-green-500" />
      <div className="flex-1 overflow-y-auto px-5 py-3 w-64 hide-scrollbar">
        <div className="text-xs font-semibold mb-3 text-muted-foreground uppercase">
          Platform
        </div>
        <ul className="space-y-1">
          {platformItems.map((item, index) => (
            <li key={index}>
              {item.isDropdown ? (
                <>
                  <div
                    onClick={() => toggleDropdown(item.label)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group cursor-pointer ${
                      isDropdownActive(item) || openDropdown === item.label
                        ? "bg-green-100 text-green-600 font-medium"
                        : "hover:bg-gray-100 hover:text-black"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isDropdownActive(item) || openDropdown === item.label
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    />
                    <span className="">{item.label}</span>
                    <div className="w-full flex justify-end items-center">
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          openDropdown === item.label 
                            ? "text-green-600 rotate-0" 
                            : "text-gray-500 -rotate-90"
                        }`} 
                      />
                    </div>
                  </div>
                  <AnimatePresence>
                    {openDropdown === item.label && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-8 mt-1 space-y-1 overflow-hidden"
                      >
                        {item.subItems.map((subItem: any, subIndex: number) => (
                          <li key={subIndex}>
                            <Link
                              to={subItem.path}
                              onClick={handleMenuItemClick}
                              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                                isActivePath(activeItem, subItem.path)
                                  ? "bg-green-100 text-green-600 font-medium"
                                  : "hover:bg-gray-100 hover:text-black"
                              }`}
                            >
                              <subItem.icon
                                className={`w-5 h-5 flex-shrink-0 ${
                                  isActivePath(activeItem, subItem.path)
                                    ? "text-green-600"
                                    : "text-gray-500"
                                }`}
                              />
                              <span className="truncate">{subItem.label}</span>
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  to={item.path}
                  onClick={handleMenuItemClick}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                    isActivePath(activeItem, item.path)
                      ? "bg-green-100 text-green-600 font-medium"
                      : "hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActivePath(activeItem, item.path)
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="my-4 border-t border-gray-300" />
        <div className="text-xs font-semibold mb-3 text-muted-foreground uppercase">
          Tools
        </div>
        <ul className="space-y-1">
          {accountItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                onClick={handleMenuItemClick}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                  activeItem === item.path
                    ? "bg-green-100 text-green-600 font-medium"
                    : "hover:bg-gray-100 hover:text-black"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    activeItem === item.path
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Render profile section for all roles */}
        {profileItems.length > 0 && (
          <>
            <div className="my-4 border-t border-gray-300" />
            <div className="text-xs font-semibold mb-3 text-muted-foreground uppercase">
              Account
            </div>
            <ul className="space-y-1 mt-4">
              {profileItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={handleMenuItemClick}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                      activeItem === item.path
                        ? "bg-green-100 text-green-600 font-medium"
                        : "hover:bg-gray-100 hover:text-black"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        activeItem === item.path
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="px-5 py-3">
        <div
          onClick={() => setLogoutModalOpen(true)}
          className="cursor-pointer flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-100 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="truncate">Logout</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {(isMobile || isMobileScreen) && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleCloseSidebar}
        />
      )}

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Konfirmasi Keluar"
        description="Apakah anda yakin ingin keluar?"
        confirmText="Keluar"
        type="logout"
      />

      {isMobile || isMobileScreen ? (
        <Sheet open={isOpen} onOpenChange={toggleSidebar}>
          <SheetContent side="left" className="p-0 w-64">
            {SidebarContent}
          </SheetContent>
        </Sheet>
      ) : (
        <AnimatePresence>{isOpen && SidebarContent}</AnimatePresence>
      )}
    </>
  );
};

export default Sidebar;