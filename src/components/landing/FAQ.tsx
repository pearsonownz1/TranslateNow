import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What is a certified translation?",
      answer:
        "A certified translation is a translation accompanied by a signed statement from the translator or translation company affirming that the translation is accurate and complete to the best of their knowledge. This certification makes the translation acceptable for official use with government agencies, educational institutions, and legal proceedings.",
    },
    {
      question: "Are your translations accepted by USCIS?",
      answer:
        "Yes, our certified translations are accepted by USCIS (U.S. Citizenship and Immigration Services) and all other government agencies. We follow all USCIS requirements for certified translations, including the certification statement, translator's signature, and proper formatting.",
    },
    {
      question: "How quickly can I get my documents translated?",
      answer:
        "Our standard service delivers translations within 3-5 business days. For urgent needs, we offer expedited service with delivery in 1-2 business days, and premium service with same-day delivery (within 24 hours) for most document types and language pairs.",
    },
    {
      question: "What languages do you translate?",
      answer:
        "We offer translation services for over 120 languages, including Spanish, French, Chinese, Arabic, Russian, Portuguese, German, Japanese, Korean, and many more. All translations are performed by native speakers with expertise in the relevant subject matter.",
    },
    {
      question: "Do I need to mail my original documents?",
      answer:
        "No, you don't need to mail your original documents. You can simply upload digital copies (scans or photos) of your documents through our secure platform. We'll translate from these digital copies and provide you with certified translations.",
    },
    {
      question:
        "What is the difference between certified and notarized translations?",
      answer:
        "A certified translation includes a signed statement from the translator attesting to the accuracy of the translation. A notarized translation takes this one step further by having the translator's signature authenticated by a notary public. Some organizations specifically require notarized translations, though certified translations are sufficient for most purposes including USCIS submissions.",
    },
    {
      question: "How much does a certified translation cost?",
      answer:
        "Our pricing starts at $24.99 per page for standard service. The final cost depends on the document type, language pair, service level (standard, expedited, or premium), and any additional services like notarization or physical delivery. You'll receive a clear price quote before confirming your order.",
    },
    {
      question: "What if my translation is rejected?",
      answer:
        "We offer a 100% acceptance guarantee. If your translation is rejected by any official institution due to quality issues or non-compliance with their requirements, we'll revise it for free or provide a full refund. However, this is extremely rare as our translations meet all official standards.",
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
            Find answers to common questions about our certified translation
            services
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
