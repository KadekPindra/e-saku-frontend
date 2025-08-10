import {
   Activity,
} from 'lucide-react'

const ViewManageExtracurricular = () => {
 return (
   <>
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 sm:p-6 mb-6 shadow-md">
         <div className="flex items-center mb-2">
            <div className="bg-green-600/40 p-2 rounded-lg mr-3">
               <Activity className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
               Manajemen Ekstrakulikuler
            </h1>
         </div>
         <p className="text-gray-600 max-w-3xl text-sm sm:text-base">
            Lihat dan kelola siswa ekstrakulikuler
         </p>
      </div>

      
   </>
 )
}

export default ViewManageExtracurricular;