import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const [isAnimated, setIsAnimated] = useState(false);
  useEffect(() => {
    setIsAnimated(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-100 dark:bg-green-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* 404 Number Animation */}
          <div
            className={`transition-all duration-1000 ease-out ${
              isAnimated
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="relative mb-8">
              <h1 className="text-[12rem] sm:text-[16rem] md:text-[20rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#8DC53E] via-[#40A48E] to-[#D5EFC2] leading-none select-none">
                404
              </h1>
              <div className="absolute inset-0 text-[12rem] sm:text-[16rem] md:text-[20rem] font-black text-gray-200 dark:text-gray-700 leading-none -z-10 blur-sm">
                404
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div
            className={`transition-all duration-1000 delay-300 ease-out ${
              isAnimated
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="mb-8">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Oops! Page Not Found
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                The page you're looking for seems to have wandered off into the
                digital wilderness. Don't worry, even the best explorers
                sometimes take a wrong turn!
              </p>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8DC53E] to-[#40A48E] text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <Home size={20} />
              Go Home
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 border-2 border-[#8DC53E] text-[#8DC53E] font-semibold rounded-lg hover:bg-[#8DC53E] hover:text-white transition-all duration-300 cursor-pointer"
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
