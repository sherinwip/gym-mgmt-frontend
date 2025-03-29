import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, UserCheck, Calendar, CreditCard, PhoneCall, RefreshCw } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

const enquiryData = [
  { name: 'Converted', value: 65, color: '#10B981' },
  { name: 'Expected', value: 45, color: '#3B82F6' },
  { name: 'Not Interested', value: 30, color: '#EF4444' },
  { name: 'Hot', value: 25, color: '#F59E0B' },
  { name: 'Cold', value: 15, color: '#6B7280' },
];

const memberAttendance = [
  {
    id: '1',
    name: 'John Doe',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    inDateTime: '2024-03-19 09:30 AM',
    balance: 250,
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Enquiry Conversion Stats</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enquiryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: '#4B5563' }} />
                  <YAxis tick={{ fill: '#4B5563' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6">
                    {enquiryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-span-full lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Member Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Active Members</span>
                <span className="font-semibold text-green-600">245</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Inactive Members</span>
                <span className="font-semibold text-red-600">32</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Member Attendance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {memberAttendance.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={member.image} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.inDateTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${member.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Member Birthdays"
          count={5}
          icon={<Calendar size={24} />}
          link="/birthdays"
          color="purple"
        />
        <DashboardCard
          title="Staff Birthdays"
          count={2}
          icon={<Users size={24} />}
          link="/staff-birthdays"
          color="pink"
        />
        <DashboardCard
          title="Enquiry Follow-ups"
          count={12}
          icon={<PhoneCall size={24} />}
          link="/enquiry-followups"
          color="blue"
        />
        <DashboardCard
          title="Memberships Ending"
          count={8}
          icon={<UserCheck size={24} />}
          link="/ending-memberships"
          color="yellow"
        />
        <DashboardCard
          title="Payment Due"
          count={15}
          icon={<CreditCard size={24} />}
          link="/payment-due"
          color="red"
        />
        <DashboardCard
          title="Renew Follow-ups"
          count={6}
          icon={<RefreshCw size={24} />}
          link="/renew-followups"
          color="green"
        />
      </div>
    </div>
  );
};

export default Dashboard;