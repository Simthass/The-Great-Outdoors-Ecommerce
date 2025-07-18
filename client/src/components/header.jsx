import React from "react";
import { ShoppingBag, Search, Bold } from "lucide-react";
import { flatMap } from "lodash";

const Header = () => {
  return (
    <header 
      className="w-full bg-cover bg-center bg-no-repeat bg-fixed" >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-6 py-4 font-jakarta text-white">
        
        {/* Logo */}
        <div className="flex items-center space-x-2 ml-[75px] mt-[20px]">
          <img 
            src="/TGO-Logo.png" 
            alt="Logo" 
            className="w-10 h-10" 
            height={63} 
            width={132}
          />
        </div>

        {/* Navigation */}
        <nav className="flex items-center justify-center text-base mt-[40px]">
          <ul className="flex items-center justify-center gap-[60px] w-full list-none" >
            <li className="ml-[100px]">
              <a 
                href="#" 
                className="text-white font-medium hover:text-[#8DC53E] hover:font-extrabold hover:underline transition-all duration-200 no-underline"
                style={{color:'white'}}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="text-white font-medium hover:text-[#8DC53E] hover:font-extrabold hover:underline transition-all duration-200 no-underline"
                style={{color:'white'}}
              >
                Shop
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="text-white font-medium hover:text-[#8DC53E] hover:font-extrabold hover:underline transition-all duration-200 no-underline"
                style={{color:'white'}}
              >
                About us
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="text-white font-medium hover:text-[#8DC53E] hover:font-extrabold hover:underline transition-all duration-200 no-underline"
                style={{color:'white'}}
              >
                Contact us
              </a>
            </li>
            <li className="mr-[100px]">
              <a 
                href="#" 
                className="text-white font-medium hover:text-[#8DC53E] hover:font-extrabold hover:underline transition-all duration-200 no-underline"
                style={{color:'white'}}
              >
                Events
              </a>
            </li>
          </ul>
        </nav>

        {/* Right Buttons */}
        <div className="flex items-center gap-x-[40px] mr-[75px] mt-[40px]">
          <button
            className="bg-[#8DC53E] text-white font-semibold hover:bg-[#7AB32E] transition-colors duration-200"
            style={{
              height: '45px',
              width: '163px',
              borderRadius: '5px',
              borderBottomRightRadius: '25px',
              boxShadow: 'none',
              border: 'none', 
              fontSize: '16px',
              color: 'white',
              fontFamily:"inherit"
            }}
          >
            Register Now
          </button>

          <button
            className="bg-[#8DC53E] text-white flex items-center justify-center hover:bg-[#7AB32E] transition-colors duration-200"
            style={{
              height: '45px',
              width: '50px',
              borderRadius: '5px',
              boxShadow: 'none',
              border: 'none',
              fontSize: '16px',
              color: 'white'
            }}
          >
            <Search size={20} />
          </button>

          <div className="text-white hover:text-[#8DC53E] transition-colors duration-200">
           <img 
            src="/cart.svg" 
            alt="Cart icon" 
            className="w-10 h-10" 
            height={24} 
            width={24}
          />

           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;