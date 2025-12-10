import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "../login-form";
import { signIn } from "next-auth/react";
// Import mockPush directly from the __mocks__ file
import { mockPush, useSearchParams } from "../../../__mocks__/next/navigation"; 
import { toast } from "sonner";

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

// The actual useRouter and useSearchParams from next/navigation will now be
// resolved to the global mock defined in __mocks__/next/navigation.ts.

// Mock next/link because it's used in the component
jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = "MockLink";
  return MockLink;
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
    mockPush.mockClear(); // Clear the mockPush calls for each test
    // Reset useSearchParams mock if needed for specific tests
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (useSearchParams as jest.Mock).mockImplementation(() => ({
      get: jest.fn((key) => {
        if (key === "callbackUrl") return "/planner";
        if (key === "error") return null;
        return null;
      }),
    }));
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
      // Assert that mockPush was called
      expect(mockPush).toHaveBeenCalledWith("/planner");
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
      expect(mockPush).not.toHaveBeenCalled(); // Ensure no redirection on error
    });
  });

  it("triggers Google sign-in", async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: true });

    render(<LoginForm />);

    const googleButton = screen.getByRole("button", { name: "Google" });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/planner" });
      // The redirection for Google Sign-in is handled internally by next-auth,
      // so we don't expect mockPush to be called explicitly here.
      // If the component were to manually call router.push after signIn('google'),
      // then this assertion would be valid.
      // expect(mockPush).toHaveBeenCalledWith("/planner"); 
    });
  });
});
