import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  image: string;
  rating: number;
}

const Testimonial = ({
  quote,
  author,
  role,
  image,
  rating,
}: TestimonialProps) => (
  <Card className="border-0 shadow-lg h-full">
    <CardContent className="p-8">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
      <blockquote className="text-lg text-gray-700 mb-6">"{quote}"</blockquote>
      <div className="flex items-center">
        <img
          src={image}
          alt={author}
          className="w-12 h-12 rounded-full mr-4 object-cover"
        />
        <div>
          <div className="font-semibold">{author}</div>
          <div className="text-sm text-gray-500">{role}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Testimonials = () => {
  // Combined testimonials for Evaluation & Academic Translation
  const testimonials = [
    {
      quote:
        "OpenEval's credential evaluation was exactly what I needed for my master's application. The university accepted the report without any problems. Very professional service!",
      author: "Priya Sharma",
      role: "Graduate Student Applicant",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      rating: 5,
    },
    {
      quote:
        "Needed my diploma translated and evaluated for a job application. OpenEval handled both quickly and the certified translation was perfect. Highly recommend!",
      author: "Kenji Tanaka",
      role: "International Professional",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji", // New seed
      rating: 5,
    },
    {
      quote:
        "The Course-by-Course evaluation and transcript translation helped me transfer my credits smoothly. The process was straightforward and the report was detailed.",
      author: "Carlos Gomez",
      role: "Transfer Student",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Success Stories: Evaluations & Translations
          </h2>
          <p className="text-xl text-gray-600">
            Hear from students and professionals who trust our academic services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              image={testimonial.image}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
