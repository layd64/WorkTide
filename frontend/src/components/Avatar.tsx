import React from 'react';
import { getInitialsAvatar } from '../utils/avatar';

interface AvatarProps {
  fullName: string;
  className?: string;
  textSize?: string;
  imageUrl?: string | null;
}

const Avatar: React.FC<AvatarProps> = ({
  fullName,
  className = 'w-10 h-10',
  textSize = 'text-sm',
  imageUrl
}) => {
  const { initials, bgColor } = getInitialsAvatar(fullName);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${fullName}'s avatar`}
        className={`${className} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} ${bgColor} rounded-full flex items-center justify-center text-white font-medium ${textSize}`}
      aria-label={`${fullName}'s avatar`}
    >
      {initials}
    </div>
  );
};

export default Avatar;