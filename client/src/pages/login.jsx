import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import

const Login = () => {
  const navigate = useNavigate(); // Add this hook
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting to login with:', { email: formData.email });

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      console.log('Login response status:', response.status);
      console.log('Login response ok:', response.ok);

      const data = await response.json();
      console.log('Login response data:', data);

      if (response.ok && data.success) {
        // Store user data and token in memory (for demo purposes)
        // In a real app with localStorage:
        // localStorage.setItem('userInfo', JSON.stringify(data.data));
        // localStorage.setItem('token', data.data.token);
        
        console.log('Login successful!', data.data);
        
        // Reset form
        setFormData({
          email: '',
          password: ''
        });
        
        // Redirect to home page after successful login
        navigate('/');
        
      } else {
        // Handle API error responses
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please make sure the backend server is running on port 5000.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Password reset instructions have been sent to your email (if the account exists).');
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google OAuth implementation
    alert('Google login will be implemented in the future');
    console.log('Google login clicked - implement OAuth flow here');
  };

  return (
    <div className="m-[100px] bg-[#ECEAEA] rounded-[20px] overflow-hidden shadow-lg">
      <div className="flex md:flex-row">
        {/* Left Side - Form */}
        <div className="md:w-1/2 w-full p-[60px] flex flex-col items-center">
          <h2 className="text-[55px] font-bold mb-[10px] text-center" style={{ color: "#7d9d49ff" }}>
            Welcome Back!
          </h2>
          
          <p className="text-[14px] mb-[60px] text-center" style={{ color: "#4f4f4f" }}>
            Sign in To Embark On An Unforgettable Outdoor Experience
          </p>

          {error && (
            <div className="w-full max-w-[350px] mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="w-full max-w-[350px] space-y-[30px]">
            {/* Email Field */}
            <div className="w-full">
              <input
                type="email"
                name="email"
                placeholder="     Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full h-[45px] px-4 bg-[#ffffff]/80 border border-transparent placeholder:text-gray-600 outline-none rounded-[5px] focus:border-[#7d9d49ff] disabled:opacity-50"
              />
            </div>
            
            {/* Password Field + Forgot Password */}
            <div className="w-full space-y-2">
              <input
                type="password"
                name="password"
                placeholder="     Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full h-[45px] px-4 bg-[#ffffff]/80 border border-transparent placeholder:text-gray-600 outline-none rounded-[5px] focus:border-[#7d9d49ff] disabled:opacity-50"
              />
         <div className="text-right">
          <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-[13px] font-semibold hover:underline disabled:opacity-50 bg-transparent border-none p-0 focus:outline-none focus:ring-0" 
             style={{ color: "#4e7f00ff" }}
               >
             Forgot Password?
         </button>
         </div>
            </div>

            {/* Buttons */}
            <div className="space-y-[30px]">
              {/* SUBMIT BUTTON - Now properly connected with onClick */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-[45px] text-[15px] rounded-lg hover:opacity-90 outline-none rounded-[5px] border-2 border-[#79a730ff] disabled:opacity-50"
                style={{
                  backgroundColor: "#79a730ff",
                  color: "#ffffffff",
                }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              
              <div className="relative flex items-center justify-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-[14px] text-gray-500 pr-[10px] pl-[10px]">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-[45px] text-[15px] rounded-lg hover:opacity-90 outline-none rounded-[5px] border-2 border-[#79a730ff] flex items-center justify-center gap-[10px] disabled:opacity-50"
                style={{
                  backgroundColor: "#79a730ff",
                  color: "#ffffff",
                }}
              >
                <img src="/googlewhite.png" alt="Google" className="w-[22px] h-[60px] object-contain" />
                Sign in with Google
              </button>
            </div>

            {/* Register Link */}
            <p className="text-[14px] pt-[18px] text-center">
              Don't Have Account?{" "}
              <a
                href="/register"
                className="font-semibold cursor-pointer no-underline hover:no-underline"
                style={{ color: "#7d9d49ff" }}
              >
                Register Now
              </a>
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="md:w-1/2 w-full">
         <div 
            className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center overflow-hidden"
            style={{ minHeight: '500px' }}
          >
          <img
            src="/camera.jpg"
            alt="Adventure"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;