import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "../login-form";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn((key) => {
      if (key === "callbackUrl") return "/planner";
      if (key === "error") return null;
      return null;
    }),
  })),
}));

// Mock next/link because it's used in the component
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the login form correctly", () => {
    render(<LoginForm />);
    
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Google" })).toBeInTheDocument();
  });

  it("submits the form with credentials", async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: true, error: null });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "password123",
        redirect: false,
        callbackUrl: "/planner",
      });
    });
  });

  it("handles login error correctly", async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: false, error: "Invalid credentials" });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Invalid email or password.");
    });
  });

  it("triggers Google sign-in", async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: true });

    render(<LoginForm />);

    const googleButton = screen.getByRole("button", { name: "Google" });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/planner" });
    });
  });
});
