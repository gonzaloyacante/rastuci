import type { Control, UseFormRegister } from "react-hook-form";

export interface Section {
  title: string;
  content: string;
  items: { value: string }[];
}

export interface PolicyForm {
  title: string;
  slug: string;
  description: string;
  sections: Section[];
  isActive: boolean;
}

export interface Policy {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: { sections: Section[] };
  isActive: boolean;
}

export interface SectionItemProps {
  index: number;
  register: UseFormRegister<PolicyForm>;
  control: Control<PolicyForm>;
  remove: (index: number) => void;
}

export interface LegalTabBarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}
