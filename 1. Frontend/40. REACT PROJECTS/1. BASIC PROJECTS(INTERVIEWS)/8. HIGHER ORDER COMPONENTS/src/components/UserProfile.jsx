import React from 'react';

const UserProfile = ({ name, email }) => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 w-96 mx-auto text-center hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
          {name?.charAt(0).toUpperCase()}
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800">{name}</h2>
      <p className="text-sm text-gray-500">{email}</p>

      <div className="mt-4 flex justify-center gap-4">
        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Message
        </button>
        <button className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
          View Profile
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
