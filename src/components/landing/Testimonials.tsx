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
  const testimonials = [
    {
      quote:
        "The certified translation was delivered ahead of schedule and accepted by USCIS without any issues. Highly recommend their services!",
      author: "Maria Rodriguez",
      role: "Immigration Applicant",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      rating: 5,
    },
    {
      quote:
        "As an immigration attorney, I've worked with many translation services, but TranslateNow consistently delivers the highest quality certified translations.",
      author: "David Chen",
      role: "Immigration Attorney",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      rating: 5,
    },
    {
      quote:
        "I needed my academic transcripts translated urgently for a university application. They delivered in just 24 hours and the university accepted them without question.",
      author: "Sophia Kim",
      role: "International Student",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600">
            Trusted by thousands of clients for certified document translations
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
