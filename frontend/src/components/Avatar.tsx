import React from 'react';
import { getInitialsAvatar } from '../utils/avatar';

interface AvatarProps {
  fullName?: string;
  className?: string;
  textSize?: string;
  imageUrl?: string | null;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  fullName = '',
  className = 'w-10 h-10',
  textSize = 'text-sm',
  imageUrl,
  onClick
}) => {
  const { initials, bgColor } = getInitialsAvatar(fullName || '');
  const cursorClass = onClick ? 'cursor-pointer' : '';

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${fullName}'s avatar`}
        className={`${className} rounded-full object-cover ${cursorClass}`}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      className={`${className} ${bgColor} rounded-full flex items-center justify-center text-white font-medium ${textSize} ${cursorClass}`}
      aria-label={`${fullName}'s avatar`}
      onClick={onClick}
    >
      {initials}
    </div>
  );
};

export default Avatar;