import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ state: null })),
  };
});

vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

global.fetch = vi.fn();

describe('Login', () => {
  const mockNavigate = vi.fn();
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      user: null,
      token: null,
      logout: vi.fn(),
    });
  });

  it('should render login form', () => {
    render(<Login />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should render form fields', () => {
    render(<Login />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'test-token',
        token: 'test-token',
        user: { id: '1', email: 'test@example.com' },
      }),
    });

    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});

