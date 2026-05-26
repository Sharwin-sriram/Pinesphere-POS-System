import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
 size?: 'sm' | 'md' | 'lg';
 color?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
 size = 'md', 
 color = 'text-white' 
}) => {
 const sizeClasses = {
 sm: 'w-4 h-4',
 md: 'w-6 h-6',
 lg: 'w-8 h-8'
 };

 return (
 <div className="flex items-center justify-center">
 <motion.div
 className={`${sizeClasses[size]} ${color}`}
 animate={{ rotate: 360 }}
 transition={{
 duration: 1,
 repeat: Infinity,
 ease: "linear"
 }}
 >
 <svg
 className="w-full h-full"
 fill="none"
 viewBox="0 0 24 24"
 >
 <circle
 className="opacity-25"
 cx="12"
 cy="12"
 r="10"
 stroke="currentColor"
 strokeWidth="4"
 />
 <path
 className="opacity-75"
 fill="currentColor"
 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
 />
 </svg>
 </motion.div>
 
 {/* Floating dots animation */}
 <div className="ml-3 flex space-x-1">
 <motion.div
 className="w-2 h-2 bg-current rounded-full"
 animate={{ y: [0, -8, 0] }}
 transition={{
 duration: 0.6,
 repeat: Infinity,
 ease: "easeInOut"
 }}
 />
 <motion.div
 className="w-2 h-2 bg-current rounded-full"
 animate={{ y: [0, -8, 0] }}
 transition={{
 duration: 0.6,
 repeat: Infinity,
 ease: "easeInOut",
 delay: 0.1
 }}
 />
 <motion.div
 className="w-2 h-2 bg-current rounded-full"
 animate={{ y: [0, -8, 0] }}
 transition={{
 duration: 0.6,
 repeat: Infinity,
 ease: "easeInOut",
 delay: 0.2
 }}
 />
 </div>
 </div>
 );
};

export default Loader;