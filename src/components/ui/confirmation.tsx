import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Info, PlusCircle, AlertTriangle, Send, UploadIcon} from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText:string;
  isLoadingExport?: boolean;
  cancelText?: string;
  items?: string;
  type: "delete" | "update" | "add" | "logout" | "report" | "export"; // Tambahkan tipe report
}

const typeStyles = {
  delete: {
    icon: <Trash2 className="w-8 h-8 text-red-500" />,
    bgColor: "bg-red-100",
    buttonColor:
      "outline-none focus:outline-none focus:border-none bg-red-500 hover:bg-red-600",
  },
  update: {
    icon: <Info className="w-8 h-8 text-blue-500" />,
    bgColor: "bg-blue-100",
    buttonColor:
      "outline-none focus:outline-none focus:border-none bg-blue-500 hover:bg-blue-600",
  },
  add: {
    icon: <PlusCircle className="w-8 h-8 text-green-500" />,
    bgColor: "bg-green-100",
    buttonColor:
      "outline-none focus:outline-none focus:border-none bg-green-500 hover:bg-green-600",
  },
  logout: {
    icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
    bgColor: "bg-red-100",
    buttonColor:
      "outline-none focus:outline-none focus:border-none bg-red-500 hover:bg-red-600",
  },
  // Tambahkan style untuk tipe report
  report: {
    icon: <Send className="w-8 h-8 text-black" />,
    bgColor: "bg-purple-100",
    buttonColor:
      "outline-none focus:outline-none focus:border-none bg-black hover:bg-black/80",
  },
  export: {
    icon: <UploadIcon className="w-8 h-8 text-green-500" />,
    bgColor: "bg-green-100",
    buttonColor:
      "outline-none focus:outline-none focus:border-none bg-green-500 hover:bg-green-600",
  },
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  isLoadingExport,
  cancelText = "Batal",
  type,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] sm:w-[400px] md:w-[450px] lg:w-[500px] p-6 sm:p-8 md:p-10 text-center bg-white rounded-lg shadow-lg">
        <DialogHeader className="flex flex-col items-center">
          <div className={`p-3 sm:p-4 rounded-lg ${typeStyles[type].bgColor}`}>
            {typeStyles[type].icon}
          </div>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-semibold mt-3">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-center md:text-lg px-4">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className={`flex flex-col gap-3 md:mt-3 sm:mt-4`}>
          <Button
            onClick={onConfirm}
            className={`${typeStyles[type].buttonColor} text-white text-base sm:text-lg`}
            disabled={isLoadingExport === true}
          >
            {confirmText}
          </Button>
          <Button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-base sm:text-lg"
          >
            {cancelText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
