import React from 'react';
import Link from 'next/link';
import { Home, BarChart2, Info, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  currentPage?: 'home' | 'compare' | 'advanced' | 'settings';
}

const Navbar: React.FC<NavbarProps> = ({ currentPage = 'home' }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-md py-2 px-4 fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600 flex items-center">
              <span className="hidden md:inline">Indian Property Calculator</span>
              <span className="md:hidden">PropCalc</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/" 
              className={`flex items-center px-3 py-2 rounded-md ${
                currentPage === 'home' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <Home className="h-5 w-5 mr-1" />
              <span>Home</span>
            </Link>
            
            <Link 
              href="/compare" 
              className={`flex items-center px-3 py-2 rounded-md ${
                currentPage === 'compare' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <BarChart2 className="h-5 w-5 mr-1" />
              <span>Compare</span>
            </Link>
            
            <Link 
              href="/advanced/Mumbai" 
              className={`flex items-center px-3 py-2 rounded-md ${
                currentPage === 'advanced' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <Info className="h-5 w-5 mr-1" />
              <span>City Details</span>
            </Link>
            
            <Link 
              href="/settings" 
              className={`flex items-center px-3 py-2 rounded-md ${
                currentPage === 'settings' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <Settings className="h-5 w-5 mr-1" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleMenu}
              className="p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mt-4 md:hidden">
            <div className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className={`flex items-center px-3 py-2 rounded-md ${
                  currentPage === 'home' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Home className="h-5 w-5 mr-2" />
                <span>Home</span>
              </Link>
              
              <Link 
                href="/compare" 
                className={`flex items-center px-3 py-2 rounded-md ${
                  currentPage === 'compare' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <BarChart2 className="h-5 w-5 mr-2" />
                <span>Compare</span>
              </Link>
              
              <Link 
                href="/advanced/Mumbai" 
                className={`flex items-center px-3 py-2 rounded-md ${
                  currentPage === 'advanced' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Info className="h-5 w-5 mr-2" />
                <span>City Details</span>
              </Link>
              
              <Link 
                href="/settings" 
                className={`flex items-center px-3 py-2 rounded-md ${
                  currentPage === 'settings' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-5 w-5 mr-2" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
