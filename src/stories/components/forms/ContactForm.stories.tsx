import type { Meta, StoryObj } from "@storybook/nextjs";
import ContactForm from "../../../components/forms/ContactForm";
import { ContactSettings } from "../../../lib/validation/contact";

const meta: Meta<typeof ContactForm> = {
  title: "Admin/Forms/ContactForm",
  component: ContactForm,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ContactForm>;

const mockInitialData: ContactSettings = {
  headerTitle: "Contact Us",
  headerSubtitle: "We are here to help",
  emails: ["support@example.com", "sales@example.com"],
  phones: ["+1234567890"],
  address: {
    lines: ["123 Main St", "Suite 100"],
    cityCountry: "Buenos Aires, Argentina",
  },
  hours: {
    title: "Opening Hours",
    weekdays: "Mon-Fri: 9am - 6pm",
    saturday: "Sat: 10am - 2pm",
    sunday: "Closed",
  },
  form: {
    title: "Send us a message",
    nameLabel: "Name",
    emailLabel: "Email",
    phoneLabel: "Phone",
    messageLabel: "Message",
    submitLabel: "Send Message",
    successTitle: "Sent!",
    successMessage: "We will get back to you soon.",
    sendAnotherLabel: "Send another",
  },
  social: {
    instagram: { username: "rastuci", url: "https://instagram.com/rastuci" },
    facebook: { username: "rastuci", url: "https://facebook.com/rastuci" },
    whatsapp: { username: "", url: "" },
    tiktok: { username: "", url: "" },
    youtube: { username: "", url: "" },
  },
  faqs: [],
};

export const Default: Story = {
  args: {
    initial: undefined,
  },
};

export const WithData: Story = {
  args: {
    initial: mockInitialData,
  },
};
