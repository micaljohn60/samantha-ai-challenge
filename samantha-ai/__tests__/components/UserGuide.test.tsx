import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import UserGuide from "@/components/UserGuide";

function getDots(container: HTMLElement) {
  return Array.from(container.querySelectorAll("button.h-2.rounded-full"));
}

describe("UserGuide", () => {
  const onClose = jest.fn();
  let container: HTMLElement;

  beforeEach(() => {
    jest.clearAllMocks();
    ({ container } = render(<UserGuide onClose={onClose} />));
  });

  it("shows the first slide (Welcome) on mount", () => {
    expect(screen.getByText("Welcome to Sammy.AI")).toBeInTheDocument();
  });

  it("does not show Back button on first slide", () => {
    expect(screen.queryByText("Back")).not.toBeInTheDocument();
  });

  it("shows Next button on first slide", () => {
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("advances to the next slide when Next is clicked", () => {
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Single Upload")).toBeInTheDocument();
  });

  it("shows Back button after advancing past the first slide", () => {
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("goes back to previous slide when Back is clicked", () => {
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Back"));
    expect(screen.getByText("Welcome to Sammy.AI")).toBeInTheDocument();
  });

  it("navigates to a specific slide via progress dots", () => {
    const dots = getDots(container);
    fireEvent.click(dots[2]); // third dot → Batch Upload
    expect(screen.getByText("Batch Upload")).toBeInTheDocument();
  });

  it("shows 'Get Started' button on last slide instead of Next", () => {
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByText("Next"));
    }
    expect(screen.getByText("Get Started")).toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  it("calls onClose when Get Started is clicked", () => {
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByText("Next"));
    }
    fireEvent.click(screen.getByText("Get Started"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows the GitHub link on the last (Under the Hood) slide", () => {
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByText("Next"));
    }
    const githubLink = screen.getByRole("link", { name: /view on github/i });
    expect(githubLink).toHaveAttribute("href", "https://github.com/micaljohn60/samantha-ai");
    expect(githubLink).toHaveAttribute("target", "_blank");
  });

  it("does not show the GitHub link on non-last slides", () => {
    expect(screen.queryByRole("link", { name: /view on github/i })).not.toBeInTheDocument();
  });

  it("calls onClose when X button is clicked", () => {
    const closeBtn = container.querySelector("button.absolute") as HTMLButtonElement;
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders 5 progress dots", () => {
    expect(getDots(container)).toHaveLength(5);
  });

  it("shows the Under the Hood tech stack on last slide", () => {
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByText("Next"));
    }
    expect(screen.getByText(/Next\.js 15/)).toBeInTheDocument();
    expect(screen.getByText(/Google Gemini/)).toBeInTheDocument();
  });
});
