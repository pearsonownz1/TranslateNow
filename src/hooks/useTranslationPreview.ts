import { useState } from "react";
import { supabase } from "@/lib/supabase-client";

export const useTranslationPreview = () => {
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTranslationPreview = async (
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> => {
    setTranslating(true);
    setError(null);

    try {
      // Limit the text length for the preview
      const previewText =
        text.length > 500 ? text.substring(0, 500) + "..." : text;

      // Call the Supabase Edge Function for translation
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-translate-preview",
        {
          body: {
            text: previewText,
            sourceLanguage,
            targetLanguage,
          },
        },
      );

      if (error) throw error;

      return data.translatedText || "Translation preview not available";
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to generate translation preview";
      setError(errorMessage);
      return "Translation preview not available";
    } finally {
      setTranslating(false);
    }
  };

  return {
    getTranslationPreview,
    translating,
    error,
  };
};
