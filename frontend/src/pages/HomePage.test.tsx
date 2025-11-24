import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import HomePage from './HomePage';

describe('HomePage', () => {
  it('should render homepage with hero section', () => {
    render(<HomePage />);
    
    // Check for hero title (there are multiple WorkTide mentions, so use getAllByText)
    const workTideElements = screen.getAllByText(/WorkTide/i);
    expect(workTideElements.length).toBeGreaterThan(0);
  });

  it('should render features section', () => {
    render(<HomePage />);
    
    // Check for features heading
    expect(screen.getByText(/Features/i)).toBeInTheDocument();
  });

  it('should render testimonials section', () => {
    render(<HomePage />);
    
    // Check for testimonials heading
    expect(screen.getByText(/Testimonials/i)).toBeInTheDocument();
  });

  it('should render call-to-action section', () => {
    render(<HomePage />);
    
    // Check for CTA text
    expect(screen.getByText(/Start using WorkTide/i)).toBeInTheDocument();
  });
});

