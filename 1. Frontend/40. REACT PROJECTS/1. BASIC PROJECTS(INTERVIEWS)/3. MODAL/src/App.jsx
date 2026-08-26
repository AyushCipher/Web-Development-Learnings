// App.jsx
import React, { useState, useEffect } from 'react';
import Modal from './components/Modal';

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Disable scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isModalOpen]);

  return (
    <div className="min-h-screen bg-gray-100 text-center p-4 space-y-10">
      {/* Content above */}
      <div className="space-y-4">
        {Array.from({ length: 15 }, (_, i) => (
          <p key={i} className="text-gray-600">
            This is some content above the button to create scrollable height.
          </p>
        ))}
      </div>

      {/* Open Modal Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Open Modal
      </button>

      {/* Content below */}
      <div className="space-y-4">
        {Array.from({ length: 15 }, (_, i) => (
          <p key={i} className="text-gray-600">
            This is some content below the button to create scrollable height.
          </p>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Hello Modal</h2>
        <p>This modal prevents background scrolling while it's open.</p>
        <button
          onClick={() => setIsModalOpen(false)}
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
        >
          Close
        </button>
      </Modal>
    </div>
  );
};

export default App;
