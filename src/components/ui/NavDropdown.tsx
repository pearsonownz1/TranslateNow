import React, { useState } from "react";
import { LucideIcon } from "lucide-react"; // Import LucideIcon type for icon prop
import { Link } from "react-router-dom"; // Import Link

// Define the structure for a dropdown item, now including an icon
interface NavDropdownItem {
  title: string;
  description: string;
  price?: string;
  icon: LucideIcon; // Use LucideIcon type for the icon component
  href?: string; // Add optional href property
}

// Define the props for the NavDropdown component
interface NavDropdownProps {
  title: string;
  items: NavDropdownItem[]; // Expect an array of items with the defined structure
}

export function NavDropdown({ title, items }: NavDropdownProps) {
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
      {/* Button to trigger the dropdown */}
      <button className="flex items-center gap-1 text-base font-medium text-gray-800 hover:text-blue-600 transition"> {/* Updated text size, weight, color, and transition */}
        {title}
        {/* Chevron icon indicating dropdown */}
        <svg
          className={`ml-1 w-4 h-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 z-50 mt-1 w-[620px] rounded-2xl bg-white shadow-2xl p-6 grid grid-cols-2 gap-x-6 gap-y-4"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {items.map(({ title, description, price, icon: Icon, href }, idx) => { // Destructure href
            const itemContent = (
              // Individual item container with hover effect
              <div
                key={idx} // Key should ideally be on the outermost element if conditional
                className="flex items-start gap-4 hover:bg-gray-50 rounded-lg p-3 -m-3 transition duration-150 ease-in-out cursor-pointer w-full" // Added w-full
              >
                {/* Icon container */}
                <div className="flex-shrink-0 bg-blue-100 text-blue-600 p-2.5 rounded-xl"> {/* Adjusted padding */}
                  <Icon className="w-5 h-5" />
                </div>
                {/* Text content container */}
                <div>
                  <p className="font-semibold text-sm text-gray-900">{title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{description}</p> {/* Adjusted margin */}
                  {price && <p className="text-xs text-gray-500 mt-1">{price}</p>} {/* Adjusted color */}
                </div>
              </div>
            );

            // Conditionally wrap with Link if href exists
            return href ? (
              <Link key={idx} to={href} className="block"> {/* Use block to make Link take full width */}
                {itemContent}
              </Link>
            ) : (
              // Render the div directly if no href
              // Need to move the key here if not wrapped by Link
              React.cloneElement(itemContent, { key: idx })
            );
          })}
        </div>
      )}
    </div>
  );
}
