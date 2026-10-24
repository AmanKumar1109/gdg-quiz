import React from 'react';
import { Link } from 'react-router-dom';
import { NeoButton } from '../components/common/NeoButton';

export const NotFoundPage = () => {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-24 h-24 mx-auto rounded-3xl bg-[#FFE600] border-4 border-black flex items-center justify-center text-4xl shadow-[6px_6px_0px_0px_#000] mb-6">
        404
      </div>
      <h1 className="text-3xl font-black text-black mb-2">
        Page Not Found
      </h1>
      <p className="text-sm font-bold text-black/60 mb-6">
        The quiz track or page you are looking for does not exist or has moved.
      </p>
      <Link to="/">
        <NeoButton variant="yellow" size="md">
          Back to Quiz Arena
        </NeoButton>
      </Link>
    </div>
  );
};
