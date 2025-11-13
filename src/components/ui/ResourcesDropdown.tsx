// components/ResourcesDropdown.tsx
import {
  Map,
  Share2,
  Cloud,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom"; // Import Link
import React, { useState } from "react";

const resources = [
  {
    title: "Help Center",
    description: "Answers to common questions and issues",
    icon: Map,
    href: "#", // Placeholder
  },
  {
    title: "Refer & Earn",
    description: "Invite others and earn rewards",
    icon: Share2,
    href: "#", // Placeholder
  },
  {
    title: "API Docs",
    description: "Automate and manage translations at scale",
    icon: Cloud,
    href: "/api-docs", // Link to the new API docs page
  },
  {
    title: "Order Lookup",
    description: "Check your order status and details",
    icon: Search,
    href: "#", // Placeholder
  },
];

export function ResourcesDropdown() {
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150); // 150ms delay before closing
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setOpen(true);
  };

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="flex items-center gap-1 text-base font-medium text-gray-800 hover:text-blue-600 transition">
        Resources
        <svg
          className={`ml-1 w-4 h-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 z-50 mt-1 w-[420px] rounded-2xl bg-white shadow-2xl p-6 flex flex-col gap-4"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Map over resources including href */}
          {resources.map(({ title, description, icon: Icon, href }, idx) => (
             // Wrap the item content in a Link
            <Link
              to={href}
              key={idx}
              className="flex items-start gap-4 hover:bg-gray-50 rounded-xl p-3 transition -m-3" // Adjust padding/margin for link
              onClick={() => setOpen(false)} // Close dropdown on click
            >
              {/* Icon Div */}
              <div className="flex items-center justify-center w-12 h-12 border border-gray-200 rounded-xl flex-shrink-0">
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
              {/* Text Div */}
              <div className="flex-grow">
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </Link> // Correctly placed closing Link tag
          ))}
        </div>
      )}
    </div>
  );
}
