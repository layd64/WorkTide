import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import Avatar from './Avatar';

describe('Avatar', () => {
  it('should render with image URL', () => {
    render(<Avatar imageUrl="http://example.com/avatar.jpg" fullName="Test User" />);
    
    const img = screen.getByAltText("Test User's avatar");
    expect(img).toHaveAttribute('src', 'http://example.com/avatar.jpg');
  });

  it('should render with initials when no image URL', () => {
    render(<Avatar fullName="John Doe" />);
    
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render with two letters for single name', () => {
    render(<Avatar fullName="John" />);
    
    expect(screen.getByText('JO')).toBeInTheDocument();
  });

  it('should handle empty name', () => {
    render(<Avatar fullName="" />);
    
    expect(screen.getByText('?')).toBeInTheDocument();
  });
});

