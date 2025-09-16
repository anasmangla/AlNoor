import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FeedbackForm from "@/components/feedback/FeedbackForm";

describe("FeedbackForm", () => {
    it("renders rating options and interest select", () => {
        render(<FeedbackForm />);
        expect(screen.getByText(/rate your first impression/i)).toBeInTheDocument();
        expect(screen.getByLabelText("1")).toBeInTheDocument();
        expect(screen.getByLabelText(/What brings you to Al Noor Farm today/i)).toBeInTheDocument();
    });

    it("shows an error when submitting without a rating", async () => {
        render(<FeedbackForm />);
        await userEvent.click(screen.getByRole("button", { name: /send feedback/i }));
        expect(await screen.findByText(/Please choose a rating/i)).toBeInTheDocument();
    });
});
