import React from 'react';
import { Check, X } from 'lucide-react';

const PasswordRequirements = ({ password }) => {
  const requirements = [
    {
      test: (p) => p.length >= 8,
      text: "At least 8 characters"
    },
    {
      test: (p) => /[A-Z]/.test(p),
      text: "At least one uppercase letter"
    },
    {
      test: (p) => /[a-z]/.test(p),
      text: "At least one lowercase letter"
    },
    {
      test: (p) => /[0-9]/.test(p),
      text: "At least one number"
    },
    {
      test: (p) => /[!@#$%^&*]/.test(p),
      text: "At least one special character (!@#$%^&*)"
    }
  ];

  return (
    <div className="mt-4 mb-2">
      <div className="text-sm font-semibold mb-2">Password Requirements:</div>
      {requirements.map((req, index) => (
        <div 
          key={index} 
          className={`flex items-center gap-2 mb-1 ${
            req.test(password) ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          {req.test(password) ? (
            <Check size={16} />
          ) : (
            <X size={16} />
          )}
          <span className="text-sm">{req.text}</span>
        </div>
      ))}
    </div>
  );
};

export default PasswordRequirements;