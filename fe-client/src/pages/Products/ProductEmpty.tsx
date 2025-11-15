import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PackageX, RotateCcw } from "lucide-react";
interface ProductEmptyProps {
  handleDefaultFilter: () => void;
}

export default function ProductEmpty({
  handleDefaultFilter,
}: ProductEmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center border-1"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 0.2,
          duration: 0.5,
          type: "spring",
          stiffness: 200,
        }}
        className="mb-6"
      >
        <PackageX className="w-24 h-24 text-gray-300" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-2xl font-semibold text-gray-700 mb-2"
      >
        Không tìm thấy sản phẩm
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-gray-500 mb-8 max-w-md"
      >
        Không có sản phẩm nào phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh bộ
        lọc hoặc tìm kiếm từ khóa khác.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Button
          onClick={handleDefaultFilter}
          className="bg-black text-white hover:bg-gray-900 px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300"
        >
          <RotateCcw className="w-4 h-4" />
          Đặt lại bộ lọc
        </Button>
      </motion.div>
    </motion.div>
  );
}
