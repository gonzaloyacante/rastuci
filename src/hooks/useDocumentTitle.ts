import { useEffect } from "react";

interface UseDocumentTitleOptions {
  title: string;
  suffix?: string;
}

/**
 * Custom hook to dynamically set the document title for client components
 * @param options - Title configuration
 */
export function useDocumentTitle({
  title,
  suffix = "Rastuci Admin",
}: UseDocumentTitleOptions) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | ${suffix}`;

    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix]);
}
