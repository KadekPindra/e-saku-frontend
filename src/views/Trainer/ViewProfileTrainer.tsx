import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Clock, Edit, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

import { ITrainer } from "@/config/Models/Trainer";
import { useTrainerById } from "@/config/Api/useTrainers";



const ViewProfileTrainer = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [trainerData, setTrainerData] = useState<ITrainer | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

    const trainerId = localStorage.getItem("trainer_id") || "";

    const { data: trainer, isLoading: trainerLoading } =
        useTrainerById(trainerId);

    
    return (
        <>
            <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 text-black">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-3">
                    <h1 className="text-3xl sm:text-4xl font-bold text-black">
                    Profil Pembina
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
                            {/* {imageSrc ? (
                            <img
                                src=""
                                alt="Student profile"
                                className="w-full h-full object-cover"
                            />
                            ) : (
                            <User
                                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-400"
                                strokeWidth={1}
                            />
                            )} */}
                        </div>
                        </CardContent>

                        <div className="p-4 w-full">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profil
                        </Button>
                        </div>
                    </Card>
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
                                {trainer?.name || '-'}
                            </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">
                                NIP
                                </label>
                                <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                                {trainer?.nip || "Tidak diatur"}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">
                                Nomor Telpon
                                </label>
                                <div className="p-2 bg-gray-100 border border-gray-200 rounded-lg">
                                {trainer?.phone_number || "Tidak diatur"}
                                </div>
                            </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                    </div>
                </div>
                </div>
        </>
    );
}

export default ViewProfileTrainer;