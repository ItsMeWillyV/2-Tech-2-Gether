import { FaUsers, FaPizzaSlice, FaMicrophone } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-event text-white py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="flex justify-center items-center gap-3 sm:gap-6 flex-wrap mb-2">
            {/* Engaging Talks */}
            <div className="flex items-center gap-1 sm:gap-2">
              <FaMicrophone className="text-yaml-yellow text-sm sm:text-lg" />
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Engaging Talks</span>
            </div>
            
            {/* Separator */}
            <span className="text-yaml-yellow text-xs sm:text-sm">|</span>
            
            {/* Networking */}
            <div className="flex items-center gap-1 sm:gap-2">
              <FaUsers className="text-yaml-yellow text-sm sm:text-lg" />
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Networking</span>
            </div>
            
            {/* Separator */}
            <span className="text-yaml-yellow text-xs sm:text-sm">|</span>
            
            {/* Free Pizza */}
            <div className="flex items-center gap-1 sm:gap-2">
              <FaPizzaSlice className="text-yaml-yellow text-sm sm:text-lg" />
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Free Pizza</span>
            </div>
          </div>
          
          <div className="text-xs opacity-70">
            <p>© 2025 Tech2Gether</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;