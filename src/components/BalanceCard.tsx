
import React from 'react';
import { motion } from 'framer-motion';

interface BalanceCardProps {
  title: string;
  balance: string;
  gradient: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ title, balance, gradient }) => {
  return (
    <motion.div
      className={`bg-gradient-to-r ${gradient} p-0.5 rounded-2xl`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <motion.div
          className="text-3xl font-bold text-white"
          animate={{ 
            textShadow: ['0 0 10px rgba(249, 115, 22, 0.5)', '0 0 20px rgba(249, 115, 22, 0.8)', '0 0 10px rgba(249, 115, 22, 0.5)']
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {balance}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BalanceCard;
