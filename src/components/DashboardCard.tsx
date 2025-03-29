import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  link?: string;
  color?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  count,
  icon,
  link,
  color = 'blue'
}) => {
  const baseCard = (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{count}</h3>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
          {icon}
        </div>
      </div>
      {link && (
        <div className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800">
          <span>View details</span>
          <ArrowRight size={16} className="ml-1" />
        </div>
      )}
    </div>
  );

  return link ? (
    <Link to={link} className="block">{baseCard}</Link>
  ) : baseCard;
};

export default DashboardCard;