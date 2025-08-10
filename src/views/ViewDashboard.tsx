import { useState, useEffect, useCallback, useMemo, ChangeEvent } from "react";
import {
  Layers,
  School,
  Search,
  Users,
  AlertTriangle,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTeacherById } from "@/config/Api/useTeacher";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { IStudent } from "@/config/Models/Student";
import { IViolation } from "@/config/Models/Violation";
import { useViolations } from "@/config/Api/useViolation";
import { IRules } from "@/config/Models/Rules";
import { useAccomplishments } from "@/config/Api/useAccomplishments";
import { IAccomplishments } from "@/config/Models/Accomplishments";
import { useStudentById } from "@/config/Api/useStudent";
import { Link } from "react-router-dom";
import { IClassroom } from "@/config/Models/Classroom";

interface LeaderboardItem {
  rank: number;
  name: string;
  points: number;
}

type TimeRange = "daily" | "weekly" | "monthly" | "yearly";

interface ChartData {
  day?: string;
  week?: string;
  month?: string;
  violations: number;
  achievements: number;
}
interface PayloadItem {
  value: number;
  name: string;
  color: string;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: PayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-lg">
        <p className="font-bold text-gray-800 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            ></div>
            <p className="text-sm">
              <span className="font-medium">{entry.name}:</span> {entry.value}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-xl overflow-hidden">
            <CardHeader className="p-4">
              <div className="flex justify-between items-start mb-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-12 h-6 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-40" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  );
};

const ViewDashboard = () => {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<"teacher" | "student">("teacher");
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");
  const [overallTimeRange, setOverallTimeRange] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("daily");
  const [yearlyView, setYearlyView] = useState<"firstHalf" | "secondHalf">(
    "firstHalf"
  );
  const [activityType, setActivityType] = useState<
    "all" | "violations" | "achievements"
  >("all");
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<
    "xs" | "sm" | "md" | "lg" | "xl"
  >("md");
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  // State for data
  const [violationData, setViolationData] = useState<IViolation[]>([]);
  const [, setAccomplishmentData] = useState<IAccomplishments[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const [statsData, setStatsData] = useState({
    totalPoints: 0,
    totalStudents: 0,
    topClass: "Unknown",
    topGrade: "",
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // Get user role and ID
  useEffect(() => {
    const role = localStorage.getItem("user_type");
    const studentId = localStorage.getItem("student_id");

    if (role === "student" && studentId) {
      setUserRole("student");
    } else {
      setUserRole("teacher");
    }
  }, []);

  // Get user data based on role
  const teacherId = localStorage.getItem("teacher_id");
  const studentId = localStorage.getItem("student_id");

  const { data: teacher } = useTeacherById(teacherId ? Number(teacherId) : 0);
  const { data: student } = useStudentById(studentId || "");

  useEffect(() => {
    if (userRole === "teacher" && teacher) {
      setUserName(teacher.name);
    } else if (userRole === "student" && student) {
      setUserName(student.name);
    }
  }, [teacher, student, userRole]);

  // Hook untuk mendapatkan data pelanggaran
  const { data: violationsResponse, isLoading: isViolationsLoading } =
    useViolations();

  // Ambil data semua kelas
  const { data: accomplishmentsResponse } = useAccomplishments();

  const getGradeFromClassroom = (classroom: IClassroom | undefined): string => {
    if (!classroom || !classroom.grade.name) return "-";
    return classroom.grade.name;
  };

  // Filter berdasarkan rentang waktu
  const filterByTimeRange = <
    T extends { violation_date?: string; accomplishment_date?: string }
  >(
    data: T[],
    range: TimeRange,
    dateKey: keyof T = "violation_date"
  ): T[] => {
    const now = new Date();
    if (range === "daily") {
      const today = now.toISOString().split("T")[0];
      return data.filter((item) => item[dateKey]?.toString().startsWith(today));
    } else if (range === "weekly") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return data.filter(
        (item) => new Date(item[dateKey] as Date) >= oneWeekAgo
      );
    } else if (range === "monthly") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return data.filter(
        (item) => new Date(item[dateKey] as Date) >= oneMonthAgo
      );
    } else if (range === "yearly") {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return data.filter(
        (item) => new Date(item[dateKey] as Date) >= oneYearAgo
      );
    }
    return data;
  };

  // Hitung statistik
  const calculateStats = useCallback(
    (violations: IViolation[]) => {
      const filteredViolations = filterByTimeRange(
        violations,
        overallTimeRange
      );

      const totalPoints = filteredViolations.reduce(
        (sum, violation) => sum + (violation.points || 0),
        0
      );

      const uniqueStudents = new Set(
        filteredViolations.map((v) => v.student_id)
      ).size;

      // Hitung pelanggaran per kelas
      const classCount: Record<string, number> = {};
      filteredViolations.forEach((v) => {
        const student = v.student as IStudent;
        const className = student?.classroom?.display_name || "-";
        classCount[className] = (classCount[className] || 0) + 1;
      });

      let topClass = "-";
      let maxClassCount = 0;
      Object.entries(classCount).forEach(([className, count]) => {
        if (count > maxClassCount) {
          maxClassCount = count;
          topClass = className;
        }
      });

      // Hitung pelanggaran per grade langsung dari classroom.grade
      const gradeCount: Record<string, number> = {};
      filteredViolations.forEach((v) => {
        const student = v.student as IStudent;
        const grade = getGradeFromClassroom(student?.classroom);

        if (grade === "X" || grade === "XI" || grade === "XII") {
          gradeCount[grade] = (gradeCount[grade] || 0) + 1;
        }
      });

      // Temukan grade dengan pelanggaran terbanyak
      let topGrade = "-";
      let maxGradeCount = 0;
      Object.entries(gradeCount).forEach(([grade, count]) => {
        if (count > maxGradeCount) {
          maxGradeCount = count;
          topGrade = grade;
        }
      });

      return {
        totalPoints,
        totalStudents: uniqueStudents,
        topClass,
        topGrade,
      };
    },
    [overallTimeRange]
  );

  // Hitung leaderboard
  const calculateLeaderboard = useCallback(
    (violations: IViolation[]) => {
      const filteredViolations = filterByTimeRange(
        violations,
        overallTimeRange
      );

      const studentPoints: Record<string, number> = {};
      filteredViolations.forEach((v) => {
        studentPoints[v.student_id] =
          (studentPoints[v.student_id] || 0) + v.points;
      });

      return Object.entries(studentPoints)
        .map(([studentId, points]) => {
          const violation = filteredViolations.find(
            (v) => v.student_id === studentId
          );
          const student = violation?.student as IStudent;
          return {
            name: student?.name || "Unknown Student",
            points,
          };
        })
        .sort((a, b) => b.points - a.points)
        .slice(0, 3)
        .map((item, index) => ({ ...item, rank: index + 1 }));
    },
    [overallTimeRange]
  );

  // Siapkan data chart
  const prepareChartData = useCallback(
    (violations: IViolation[], accomplishments: IAccomplishments[]) => {
      if (timeRange === "weekly") {
        const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jum'at"];

        const filteredViolations = filterByTimeRange(
          violations,
          "weekly",
          "violation_date"
        );
        const filteredAccomplishments = filterByTimeRange(
          accomplishments,
          "weekly",
          "accomplishment_date"
        );

        const violationsByDay: Record<string, number> = {};
        filteredViolations.forEach((v) => {
          const dayIndex = new Date(v.violation_date).getDay();
          const adjustedDay = (dayIndex + 6) % 7;
          if (adjustedDay >= 0 && adjustedDay <= 4) {
            const dayName = days[adjustedDay];
            violationsByDay[dayName] = (violationsByDay[dayName] || 0) + 1;
          }
        });

        const accomplishmentsByDay: Record<string, number> = {};
        filteredAccomplishments.forEach((a) => {
          const dayIndex = new Date(a.accomplishment_date).getDay();
          const adjustedDay = (dayIndex + 6) % 7;
          if (adjustedDay >= 0 && adjustedDay <= 4) {
            const dayName = days[adjustedDay];
            accomplishmentsByDay[dayName] =
              (accomplishmentsByDay[dayName] || 0) + 1;
          }
        });

        return days.map((day) => ({
          day,
          violations: violationsByDay[day] || 0,
          achievements: accomplishmentsByDay[day] || 0,
        }));
      } else if (timeRange === "monthly") {
        const weeks = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];

        const filteredViolations = filterByTimeRange(
          violations,
          "monthly",
          "violation_date"
        );
        const filteredAccomplishments = filterByTimeRange(
          accomplishments,
          "monthly",
          "accomplishment_date"
        );

        const violationsByWeek: Record<string, number> = {};
        filteredViolations.forEach((v) => {
          const date = new Date(v.violation_date);
          const dayOfMonth = date.getDate();
          const weekNumber = Math.floor(dayOfMonth / 7);
          const weekKey = weeks[Math.min(weekNumber, 3)]; // Pastikan tidak melebihi index 3
          violationsByWeek[weekKey] = (violationsByWeek[weekKey] || 0) + 1;
        });

        const accomplishmentsByWeek: Record<string, number> = {};
        filteredAccomplishments.forEach((a) => {
          const date = new Date(a.accomplishment_date);
          const dayOfMonth = date.getDate();
          const weekNumber = Math.floor(dayOfMonth / 7);
          const weekKey = weeks[Math.min(weekNumber, 3)];
          accomplishmentsByWeek[weekKey] =
            (accomplishmentsByWeek[weekKey] || 0) + 1;
        });

        return weeks.map((week) => ({
          week,
          violations: violationsByWeek[week] || 0,
          achievements: accomplishmentsByWeek[week] || 0,
        }));
      } else {
        // Yearly view
        const firstHalfMonths = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];
        const secondHalfMonths = ["Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const months =
          yearlyView === "firstHalf" ? firstHalfMonths : secondHalfMonths;

        const filteredViolations = violations.filter((v) => {
          const date = new Date(v.violation_date);
          const month = date.getMonth();
          return yearlyView === "firstHalf" ? month < 6 : month >= 6;
        });

        const filteredAccomplishments = accomplishments.filter((a) => {
          const date = new Date(a.accomplishment_date);
          const month = date.getMonth();
          return yearlyView === "firstHalf" ? month < 6 : month >= 6;
        });

        const violationsByMonth: Record<string, number> = {};
        filteredViolations.forEach((v) => {
          const date = new Date(v.violation_date);
          const monthIndex = date.getMonth();
          const monthName =
            yearlyView === "firstHalf"
              ? firstHalfMonths[monthIndex]
              : secondHalfMonths[monthIndex - 6];
          violationsByMonth[monthName] =
            (violationsByMonth[monthName] || 0) + 1;
        });

        const accomplishmentsByMonth: Record<string, number> = {};
        filteredAccomplishments.forEach((a) => {
          const date = new Date(a.accomplishment_date);
          const monthIndex = date.getMonth();
          const monthName =
            yearlyView === "firstHalf"
              ? firstHalfMonths[monthIndex]
              : secondHalfMonths[monthIndex - 6];
          accomplishmentsByMonth[monthName] =
            (accomplishmentsByMonth[monthName] || 0) + 1;
        });

        return months.map((month) => ({
          month,
          violations: violationsByMonth[month] || 0,
          achievements: accomplishmentsByMonth[month] || 0,
        }));
      }
    },
    [timeRange, yearlyView]
  );

  // Proses data saat data berubah
  useEffect(() => {
    if (violationsResponse && accomplishmentsResponse) {
      setViolationData(violationsResponse);
      setAccomplishmentData(accomplishmentsResponse);

      const stats = calculateStats(violationsResponse);
      setStatsData(stats);

      const leaderboard = calculateLeaderboard(violationsResponse);
      setLeaderboardData(leaderboard);

      const chart = prepareChartData(
        violationsResponse,
        accomplishmentsResponse
      );
      setChartData(chart);

      setIsLoading(false);
    }
  }, [
    violationsResponse,
    accomplishmentsResponse,
    calculateStats,
    calculateLeaderboard,
    prepareChartData,
  ]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setCurrentBreakpoint("xs");
      else if (width < 768) setCurrentBreakpoint("sm");
      else if (width < 1024) setCurrentBreakpoint("md");
      else if (width < 1280) setCurrentBreakpoint("lg");
      else setCurrentBreakpoint("xl");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }, []);

  // Filter data untuk tabel
  const filteredViolationData = useMemo(() => {
    // Filter berdasarkan rentang waktu keseluruhan
    const timeFiltered = filterByTimeRange(violationData, overallTimeRange);

    // Filter berdasarkan pencarian
    return timeFiltered.filter((violation) => {
      const student = violation.student as IStudent;
      const rules = violation.rules_of_conduct as IRules;
      const className = student?.classroom?.display_name || "-";

      const searchLower = searchText.toLowerCase();
      return (
        searchText === "" ||
        student?.name?.toLowerCase().includes(searchLower) ||
        student?.nis?.includes(searchText) ||
        className.toLowerCase().includes(searchLower) ||
        rules?.name?.toLowerCase().includes(searchLower)
      );
    });
  }, [violationData, overallTimeRange, searchText]);

  const totalPages = useMemo(() => {
    return Math.max(
      1,
      Math.ceil(filteredViolationData.length / parseInt(rowsPerPage))
    );
  }, [filteredViolationData.length, rowsPerPage]);

  // Pagination
  const displayedViolationData = useMemo(() => {
    const startIndex = (currentPage - 1) * parseInt(rowsPerPage);
    const endIndex = startIndex + parseInt(rowsPerPage);
    return filteredViolationData.slice(startIndex, endIndex);
  }, [filteredViolationData, currentPage, rowsPerPage]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * parseInt(rowsPerPage);
  }, [currentPage, rowsPerPage]);

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (isLoading || isViolationsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">
          Halo🙌, <span className="text-green-500">{userName}</span>
          {userRole === "student" ? " (Siswa)" : " (Guru)"}
        </h1>
        <p className="text-md sm:text-xl lg:text-2xl font-bold leading-tight">
          Selamat datang di website E-Saku Peserta Didik😊
        </p>
      </div>
      {/* Grid for Cards - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="rounded-xl overflow-hidden bg-green-500">
          <CardContent className="p-0">
            <div className="p-5 text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-green-600/40 p-2 rounded-lg">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl md:text-3xl font-bold">
                  {statsData.totalPoints}
                </p>
                <p className="text-sm text-white/80">Total Poin Pelanggaran</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl overflow-hidden bg-green-500">
          <CardContent className="p-0">
            <div className="p-5 text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-green-600/40 p-2 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl md:text-3xl font-bold">
                  {statsData.totalStudents}
                </p>
                <p className="text-sm text-white/80">Total Siswa Melanggar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl overflow-hidden bg-green-500">
          <CardContent className="p-0">
            <div className="p-5 text-white">
              <div className="flex items-start mb-4">
                <div className="bg-green-600/40 p-2 rounded-lg">
                  <School className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl md:text-3xl font-bold">
                  {statsData.topClass}
                </p>
                <p className="text-sm text-white/80">
                  Kelas Pelanggar Terbanyak
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl overflow-hidden bg-green-500">
          <CardContent className="p-0">
            <div className="p-5 text-white">
              <div className="flex items-start mb-4">
                <div className="bg-green-600/40 p-2 rounded-lg">
                  <Layers className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl md:text-3xl font-bold">
                  {statsData.topGrade}
                </p>
                <p className="text-sm text-white/80">
                  Tingkat Pelanggar Terbanyak
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Grid for Main Content (Comparisons & Leaderboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart Card */}
        <div className="col-span-1 lg:col-span-2">
          <Card className="rounded-xl overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800">
                  Perbandingan Aktivitas Siswa
                </CardTitle>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
                  <Select
                    value={activityType}
                    onValueChange={(v: "all" | "violations" | "achievements") =>
                      setActivityType(v)
                    }
                  >
                    <SelectTrigger className="border-green-500 focus:ring-green-400 w-full xs:w-auto xs:min-w-[140px] rounded-lg">
                      <SelectValue placeholder="Jenis Aktivitas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="violations">Pelanggaran</SelectItem>
                      <SelectItem value="achievements">Prestasi</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={timeRange}
                    onValueChange={(v) => {
                      setTimeRange(v as TimeRange);
                      if (v !== "yearly") setYearlyView("firstHalf");
                    }}
                  >
                    <SelectTrigger className="border-green-500 focus:ring-green-400 w-full xs:w-auto xs:min-w-[120px] rounded-lg">
                      <SelectValue placeholder="Rentang Waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Minggu Ini</SelectItem>
                      <SelectItem value="monthly">Bulan Ini</SelectItem>
                      <SelectItem value="yearly">Tahun Ini</SelectItem>
                    </SelectContent>
                  </Select>

                  {timeRange === "yearly" && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={
                          yearlyView === "firstHalf" ? "default" : "outline"
                        }
                        size="sm"
                        className="h-8"
                        onClick={() => setYearlyView("firstHalf")}
                      >
                        Jan-Jun
                      </Button>
                      <Button
                        variant={
                          yearlyView === "secondHalf" ? "default" : "outline"
                        }
                        size="sm"
                        className="h-8"
                        onClick={() => setYearlyView("secondHalf")}
                      >
                        Jul-Des
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6">
              <div className="w-full h-48 sm:h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    barGap={currentBreakpoint === "xs" ? 5 : 10}
                    margin={{
                      top: 10,
                      right: currentBreakpoint === "xs" ? 5 : 10,
                      left: currentBreakpoint === "xs" ? -10 : 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey={
                        timeRange === "weekly"
                          ? "day"
                          : timeRange === "monthly"
                          ? "week"
                          : "month"
                      }
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize:
                          currentBreakpoint === "xs"
                            ? 9
                            : currentBreakpoint === "sm"
                            ? 10
                            : 12,
                      }}
                      interval={currentBreakpoint === "xs" ? 1 : 0}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize:
                          currentBreakpoint === "xs"
                            ? 9
                            : currentBreakpoint === "sm"
                            ? 10
                            : 12,
                      }}
                      width={currentBreakpoint === "xs" ? 30 : 40}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                      wrapperStyle={{ outline: "none" }}
                    />
                    <Bar
                      dataKey="violations"
                      name="Pelanggaran"
                      fill="#14532d"
                      radius={[4, 4, 0, 0]}
                      hide={activityType === "achievements"}
                    />
                    <Bar
                      dataKey="achievements"
                      name="Prestasi"
                      fill="#00BB1C"
                      radius={[4, 4, 0, 0]}
                      hide={activityType === "violations"}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4 sm:gap-6 py-4 border-t">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 block bg-[#14532d] rounded"></span>
                <span className="text-xs sm:text-sm">Pelanggaran</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 block bg-[#00BB1C] rounded"></span>
                <span className="text-xs sm:text-sm">Prestasi</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Leaderboard Card */}
        <div className="order-2 xl:order-none">
          <Card className="rounded-xl overflow-hidden">
            <CardHeader className="text-center bg-green-500 text-white p-4">
              <CardTitle>Peringkat Pelanggaran</CardTitle>
            </CardHeader>
            <CardContent className="p-0 min-h-[300px] flex flex-col justify-between">
              <div>
                {leaderboardData.length > 0 ? (
                  leaderboardData.map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 border-b hover:bg-green-50 transition-colors"
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full mr-3 text-lg font-bold ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-600 ring-1 ring-yellow-200"
                            : index === 1
                            ? "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
                            : "bg-orange-100 text-orange-600 ring-1 ring-orange-200"
                        }`}
                      >
                        {student.rank}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {student.name}
                        </p>
                        <div className="flex items-center">
                          <p className="text-sm text-gray-500">
                            Poin Pelanggaran:
                          </p>
                          <Badge
                            variant="outline"
                            className="ml-2 rounded-full"
                          >
                            {student.points}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Award
                          className={`h-5 w-5 ${
                            index === 0
                              ? "text-yellow-500"
                              : index === 1
                              ? "text-gray-500"
                              : "text-orange-500"
                          }`}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Award className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 font-medium">
                      Belum ada data pelanggaran
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Tidak ada siswa yang memiliki poin pelanggaran
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Violation List Section - Now responsive with card list on mobile */}
      <div>
        <Card className="rounded-xl overflow-hidden">
          <div className="px-4 sm:px-6 pt-4 pb-4 border-b-2 border-green-500">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                Daftar Siswa Melanggar{" "}
                {overallTimeRange === "daily"
                  ? "Hari Ini"
                  : overallTimeRange === "weekly"
                  ? "Minggu Ini"
                  : overallTimeRange === "monthly"
                  ? "Bulan Ini"
                  : "Tahun Ini"}
              </CardTitle>
              <div className="md:flex items-center space-y-2 md:space-y-0 gap-2">
                <Select
                  value={overallTimeRange}
                  onValueChange={(
                    v: "daily" | "weekly" | "monthly" | "yearly"
                  ) => setOverallTimeRange(v)}
                >
                  <SelectTrigger className="border-green-500 focus:ring-green-400 w-full xs:w-auto xs:min-w-[140px] rounded-lg">
                    <SelectValue placeholder="Rentang Waktu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Hari Ini</SelectItem>
                    <SelectItem value="weekly">Minggu Ini</SelectItem>
                    <SelectItem value="monthly">Bulan Ini</SelectItem>
                    <SelectItem value="yearly">Tahun Ini</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={searchText}
                    onChange={handleSearchChange}
                    placeholder="Cari siswa..."
                    className="pl-9 bg-white border-gray-200 w-full rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden sm:block overflow-x-auto pt-3">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-12 text-center px-2 sm:px-6 font-medium text-black text-xs sm:text-sm">
                    No
                  </TableHead>
                  <TableHead className="text-center font-medium text-black text-xs sm:text-sm">
                    NIS
                  </TableHead>
                  <TableHead className="text-center font-medium text-black text-xs sm:text-sm">
                    Nama
                  </TableHead>
                  <TableHead className="text-center font-medium text-black text-xs sm:text-sm hidden md:table-cell">
                    Kelas
                  </TableHead>
                  <TableHead className="text-center font-medium text-black text-xs sm:text-sm hidden lg:table-cell">
                    Jenis Pelanggaran
                  </TableHead>
                  <TableHead className="text-center font-medium text-black text-xs sm:text-sm">
                    Poin
                  </TableHead>
                  <TableHead className="text-center font-medium text-black text-xs sm:text-sm sm:table-cell">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedViolationData.map((violation, index) => {
                  return (
                    <TableRow
                      key={violation.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <TableCell className="text-center px-2 sm:px-6 font-normal text-xs sm:text-sm">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="text-center font-normal text-xs sm:text-sm">
                        {violation.student?.nis}
                      </TableCell>
                      <TableCell className="text-left font-normal text-xs sm:text-sm">
                        <Link
                          to={`/studentbio/${violation.student?.id}`}
                          className="hover:text-green-500 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="truncate">
                              {violation.student?.name}
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-center font-normal text-xs sm:text-sm hidden md:table-cell">
                        {violation.student?.classroom?.display_name || "-"}
                      </TableCell>
                      <TableCell className="text-center font-normal text-xs sm:text-sm hidden lg:table-cell">
                        {violation.rules_of_conduct.name}
                      </TableCell>
                      <TableCell className="text-center font-normal text-xs sm:text-sm">
                        <Badge variant="outline" className="text-xs">
                          {violation.points}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-normal text-xs sm:text-sm sm:table-cell">
                        <Badge variant="secondary" className="text-xs">
                          {violation.student?.point_total}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {displayedViolationData.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500 text-sm"
                    >
                      Tidak ada data yang sesuai dengan pencarian
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List (shown on mobile) */}
          <div className="sm:hidden p-4 space-y-4">
            {displayedViolationData.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Tidak ada data yang sesuai dengan pencarian
              </div>
            ) : (
              displayedViolationData.map((violation) => {
                return (
                  <Card key={violation.id} className="border rounded-lg">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link
                            to={`/studentbio/${violation.student?.id}`}
                            className="text-green-500 font-medium transition-colors"
                          >
                            {violation.student?.name}
                          </Link>
                          <p className="text-xs text-gray-500">
                            NIS: {violation.student?.nis}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          #{violation.id}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Kelas</p>
                          <p className="text-sm">
                            {violation.student?.classroom?.display_name || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pelanggaran</p>
                          <p className="text-sm">
                            {violation.rules_of_conduct.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Poin</p>
                          <Badge
                            variant="outline"
                            className="text-xs bg-red-100 text-red-500 border-red-500"
                          >
                            {violation.points}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              violation.student?.point_total !== undefined &&
                              violation.student?.point_total <= 20
                                ? "bg-green-100 text-green-500 border-green-500"
                                : violation.student?.point_total !==
                                    undefined &&
                                  violation.student?.point_total >= 21 &&
                                  violation.student?.point_total <= 60
                                ? "bg-yellow-100 text-yellow-500 border-yellow-500"
                                : violation.student?.point_total !==
                                    undefined &&
                                  violation.student?.point_total > 60
                                ? "bg-red-100 text-red-500 border-red-500"
                                : ""
                            }`}
                          >
                            {violation.student?.point_total}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Pagination - Works for both views */}
          <div className="px-4 sm:px-6 py-4 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center border-t">
            <div className="flex justify-between items-center gap-2 xs:gap-4">
              <div className="text-xs sm:text-sm text-gray-500">
                Menampilkan {displayedViolationData.length} dari{" "}
                {filteredViolationData.length} siswa
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600">Baris:</span>
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

            <div className="flex items-center justify-center sm:justify-end gap-2">
              <Button
                variant="outline"
                size="icon"
                className="text-gray-700 rounded-lg h-8 w-8 hover:bg-green-50 hover:text-green-600 hover:border-green-500 transition-colors"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-xs sm:text-sm text-gray-600 px-2">
                {currentPage} / {totalPages}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="text-gray-700 rounded-lg h-8 w-8 hover:bg-green-50 hover:text-green-600 hover:border-green-500 transition-colors"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ViewDashboard;
