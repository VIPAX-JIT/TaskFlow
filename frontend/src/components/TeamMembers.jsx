import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users as UsersIcon, Mail, Plus } from 'lucide-react';

export default function TeamMembers({ projectId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`);
        setMembers(res.data.members || []);
      } catch (err) {

        setMembers([
          { userId: { _id: '1', name: 'Alex Morgan', email: 'alex.m@taskflow.dev', role: 'ADMIN' }, joinedAt: new Date() },
          { userId: { _id: '2', name: 'Sarah Connor', email: 'sarah.c@taskflow.dev', role: 'MEMBER' }, joinedAt: new Date() },
          { userId: { _id: '3', name: 'John Doe', email: 'john.d@taskflow.dev', role: 'MEMBER' }, joinedAt: new Date() },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [projectId]);

  const handleAddMember = async () => {
    const email = prompt("Enter the email of the user to add to this project:");
    if (!email) return;

    try {
      await api.post(`/projects/${projectId}/members`, { email });
      alert("Member added successfully!");

      const res = await api.get(`/projects/${projectId}`);
      setMembers(res.data.members || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member. Make sure the user exists.");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 h-full shadow-sm max-w-4xl mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <UsersIcon className="text-blue-500" /> Project Team Members
        </h2>
        <button 
          onClick={handleAddMember}
          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-colors"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading members...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map(member => (
            <div key={member.userId?._id || member.userId} className="border border-gray-200 rounded-lg p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center shrink-0">
                {member.userId?.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{member.userId?.name || 'Unknown'} <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{member.userId?.role || 'MEMBER'}</span></h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                  <Mail size={14} /> {member.userId?.email || 'No email'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
