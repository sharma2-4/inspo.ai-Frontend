import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export const Toast = ({ message, type = "success" }) => {
  const typeClasses = {
    success: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    info: "bg-blue-100 text-blue-800 border-blue-300"
  };

  const Icon = type === "success" ? CheckCircle : AlertCircle;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg border ${typeClasses[type]}`}
    >
      <Icon className="mr-2" size={18} />
      <span className="font-medium">{message}</span>
    </motion.div>
  );
};