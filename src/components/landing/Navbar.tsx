import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"}`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          {/* Use the new logo image (logo2.png), increased fixed height */}
          <img src="/logos/logo2.png" alt="OpenTranslate Logo" className="h-16 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center">
                Solutions <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem>
                <Link to="/solutions" className="w-full">
                  All Solutions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/solutions#immigration" className="w-full">
                  Immigration Documents
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/solutions#legal" className="w-full">
                  Legal Documents
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/solutions#academic" className="w-full">
                  Academic Records
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/solutions#business" className="w-full">
                  Business Documents
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center">
                Resources <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem>
                <Link to="/resources" className="w-full">
                  All Resources
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/resources#blog" className="w-full">
                  Blog
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/resources#guides" className="w-full">
                  Translation Guides
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/resources#faq" className="w-full">
                  FAQ
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" asChild>
            <Link to="/pricing">Pricing</Link>
          </Button>

          <Button variant="ghost" asChild>
            <Link to="/contact">Contact</Link>
          </Button>

          <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </Button>

          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          >
            <Link to="/checkout">Start Now</Link>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <div className="flex flex-col gap-2 pb-4 border-b">
                  <h3 className="font-medium">Solutions</h3>
                  <Link
                    to="/solutions"
                    className="text-gray-600 hover:text-gray-900 pl-2"
                  >
                    All Solutions
                  </Link>
                  <Link
                    to="/solutions#immigration"
                    className="text-gray-600 hover:text-gray-900 pl-2"
                  >
                    Immigration Documents
                  </Link>
                  <Link
                    to="/solutions#legal"
                    className="text-gray-600 hover:text-gray-900 pl-2"
                  >
                    Legal Documents
                  </Link>
                  <Link
                    to="/solutions#academic"
                    className="text-gray-600 hover:text-gray-900 pl-2"
                  >
                    Academic Records
                  </Link>
                  <Link
                    to="/solutions#business"
                    className="text-gray-600 hover:text-gray-900 pl-2"
                  >
                    Business Documents
                  </Link>
                </div>

                <div className="flex flex-col gap-2 pb-4 border-b">
                  <h3 className="font-medium">Resources</h3>
                  <Link
                    to="/resources"
                    className="text-gray-600 hover:text-gray-900 pl-2"
                  >
                    All Resources
                  </Link>
                  <Link
                    to="/resources#blog"
                    className="text-gray-600 hover:text-gray-900 pl-2"
                  >
                    Blog
                  </Link>
                  <Link
                    to="/resources#guides"
                    className="text-gray-600 hover:text-gray-900 pl-2"
                  >
                    Translation Guides
                  </Link>
                  <Link
                    to="/resources#faq"
                    className="text-gray-600 hover:text-gray-900 pl-2"
                  >
                    FAQ
                  </Link>
                </div>

                <Link to="/pricing" className="font-medium hover:text-gray-900">
                  Pricing
                </Link>
                <Link to="/contact" className="font-medium hover:text-gray-900">
                  Contact
                </Link>
                <Link to="/login" className="font-medium hover:text-gray-900">
                  Login
                </Link>

                <Button
                  asChild
                  className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                >
                  <Link to="/checkout">Start Now</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
