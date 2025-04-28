import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  // Combined FAQs for Evaluation & Academic Translation
  const faqs = [
    {
      question: "What is a credential evaluation?",
      answer:
        "A credential evaluation assesses foreign academic/professional degrees against U.S. standards, providing an equivalency report for universities, employers, licensing boards, and USCIS.",
    },
     {
      question: "What is a certified translation for academic documents?",
      answer:
        "It's a translation of your diploma, transcript, or other academic record accompanied by a signed statement from the translator attesting to its accuracy and completeness, making it suitable for official submission.",
    },
    {
      question: "Who accepts OpenEval reports and translations?",
      answer:
        "Our evaluation reports and certified translations are widely accepted by U.S. universities, colleges, employers, licensing boards, and government agencies, including USCIS. We adhere to the highest standards.",
    },
    {
      question: "Do I need both evaluation and translation?",
      answer:
        "If your documents are not in English, you typically need both. The certified translation makes the document understandable, and the evaluation assesses its U.S. equivalency. Check the requirements of the institution you're applying to.",
    },
    {
      question: "What's the difference between General and Course-by-Course evaluation?",
      answer:
        "A General evaluation provides the U.S. equivalency of your degree. A Course-by-Course evaluation adds a detailed breakdown of subjects, credits, grades, and GPA, often required for university admission or transfer.",
    },
    {
      question: "How long does the process take?",
      answer:
        "Standard turnaround is typically 5-10 business days for evaluations and 1-3 days for translations. Rush options are available for both services.",
    },
    {
      question: "How much do these services cost?",
      answer:
        "Credential Evaluations start at $99, and Certified Academic Translations start at $24.99 per page. Bundle options are available. See our Pricing section for details.",
    },
    {
      question: "Do I need to send original documents?",
      answer:
        "No, clear digital copies (scans or photos) uploaded through our secure portal are usually sufficient for both evaluation and translation.",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Answers to common questions about credential evaluation and academic translation.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
