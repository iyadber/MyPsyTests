import { motion } from 'motion/react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-paper z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.8,
          ease: "easeOut"
        }}
        className="flex flex-col items-center"
      >
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="w-32 h-32 mb-6 object-contain"
          onError={(e) => {
            // Fallback if logo.png doesn't exist or is empty
            e.currentTarget.style.display = 'none';
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-primary text-2xl font-bold font-sans"
        >
          نفسيتي
        </motion.div>
        
        <motion.div 
          className="mt-12 flex space-x-2 space-x-reverse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        </motion.div>
      </motion.div>
    </div>
  );
}
