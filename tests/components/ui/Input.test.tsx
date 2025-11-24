/// <reference types="jest" />
import { Input } from "@/components/ui/Input";
import { fireEvent, render, screen } from "@testing-library/react";

describe("Input Component", () => {
  it("renders with default props", () => {});

  it("applies error styles when error prop is provided", () => {
    render(<Input error placeholder="Error input" />);
    const input = screen.getByPlaceholderText("Error input");
    expect(input).toHaveClass("border-error");
  });

  it("supports different input types", () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

    rerender(<Input type="password" />);
    expect(
      screen.getByLabelText(/password/i) || screen.getByDisplayValue("")
    ).toHaveAttribute("type", "password");
  });

  it("forwards ref correctly", () => {
    const ref = jest.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it("supports focus and blur events", () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);

    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });
});
