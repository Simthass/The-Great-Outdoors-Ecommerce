import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import

const Register = () => {
  const navigate = useNavigate(); // Add this hook
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check if terms are agreed
    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms and Conditions');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting to register with data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address
      });

      // Test if server is reachable first
      console.log('Testing server connection...');
      
      try {
        const healthCheck = await fetch('http://localhost:5000/api/health');
        console.log('Health check response:', healthCheck.status, healthCheck.ok);
        const healthData = await healthCheck.json();
        console.log('Health data:', healthData);
      } catch (healthError) {
        console.error('Health check failed:', healthError);
        throw new Error('Cannot reach server - health check failed');
      }

      console.log('Server is reachable, attempting registration...');

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          password: formData.password
        }),
      });

      console.log('Registration response status:', response.status);
      console.log('Registration response ok:', response.ok);
      console.log('Registration response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Registration response data:', data);

      if (data.success) {
        // Store user data and token (Note: localStorage not available in artifacts)
        console.log('Registration successful!', data.data);
        
        // In a real app with localStorage:
        // localStorage.setItem('userInfo', JSON.stringify(data.data));
        // localStorage.setItem('token', data.data.token);
        
        // Redirect to home page after successful registration
        navigate('/'); // This will redirect to home page
        
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Full error object:', error);
      
      if (error.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please make sure the backend server is running on port 5000.');
      } else if (error.message.includes('HTTP error')) {
        setError(`Server error: ${error.message}. Please check the server logs.`);
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      password: '',
      agreeToTerms: false
    });
    setError('');
    
    // Redirect to previous page
    navigate(-1);  // This will go back to the previous page
  };

  return (
    <div className="m-[100px] bg-[#ECEAEA] rounded-[20px] overflow-hidden shadow-lg">
      <div className="flex md:flex-row">
        {/* Left Side - Image */}
          <div 
            className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center overflow-hidden"
            style={{ minHeight: '500px' }}
          >
          <img
            src="/water.jpg"
            alt="Adventure"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          </div>
        {/* Right Side - Form */}
        <div className="md:w-1/2 w-full flex flex-col items-center p-[50px]">
          <h2 className="text-[55px] font-bold mb-[10px] text-center" style={{ color: "#7d9d49ff" }}>
            Join The <br />
            <span style={{ color: "#7d9d49ff" }}>Adventure Challenge</span>
          </h2>
          <p className="text-[14px] mb-[50px] text-center" style={{ color: "#4f4f4f" }}>
            Sign Up To Embark On An Unforgettable Outdoor Experience
          </p>

          {error && (
            <div className="w-full max-w-[550px] mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form className="w-full max-w-[550px] space-y-[30px]" onSubmit={handleSubmit}>
            <div className="flex gap-[50px] w-full">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="flex-1 h-[41px] pl-[40px] bg-[#ffffff]/50 border border-transparent placeholder:text-gray-600 outline-none rounded-[5px] focus:border-[#7d9d49ff]"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="flex-1 h-[41px] pl-[40px] bg-[#ffffff]/50 border border-transparent placeholder:text-gray-600 outline-none rounded-[5px] focus:border-[#7d9d49ff]"
              />
            </div>

            <div className="flex gap-[50px] w-full">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="flex-1 h-[41px] pl-[40px] bg-[#ffffff]/50 border border-transparent placeholder:text-gray-600 outline-none rounded-[5px] focus:border-[#7d9d49ff]"
              />
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="flex-1 h-[41px] pl-[40px] bg-[#ffffff]/50 border border-transparent placeholder:text-gray-600 outline-none rounded-[5px] focus:border-[#7d9d49ff]"
              />
            </div>

            <div className="flex gap-[50px] w-full">
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
                className="flex-1 h-[41px] pl-[40px] bg-[#ffffff]/50 border border-transparent placeholder:text-gray-600 outline-none rounded-[5px] focus:border-[#7d9d49ff]"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength="6"
                className="flex-1 h-[41px] pl-[40px] bg-[#ffffff]/50 border border-transparent placeholder:text-gray-600 outline-none rounded-[5px] focus:border-[#7d9d49ff]"
              />
            </div>

            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="mt-1" 
                required
              />
              <label className="text-[14px]" style={{ color: "#4f4f4f" }}>
                By Signing up, you agree to our{" "}
                <span style={{ color: "#7d9d49ff", fontWeight: "600" }}>
                  Terms and Conditions
                </span>
              </label>
            </div>

            <div className="flex justify-between mt-[50px] gap-[50px]">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-full h-[45px] text-[15px] rounded-lg hover:opacity-90 outline-none rounded-[5px] border-2 border-[#79a730ff] disabled:opacity-50"
                style={{
                  backgroundColor: "#79a730ff",
                  color: "#ffffffff",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[45px] text-[15px] rounded-lg hover:opacity-90 outline-none rounded-[5px] border-2 border-[#79a730ff] disabled:opacity-50"
                style={{
                  backgroundColor: "#79a730ff",
                  color: "#ffffffff",
                }}
              >
                {loading ? 'Registering...' : 'Submit'}
              </button>
            </div>

            <p className="text-[14px] pt-[20px] text-center">
              Have Already an Account?{" "}
              <a
                href="/login"
                className="font-semibold cursor-pointer no-underline hover:no-underline"
                style={{ color: "#7d9d49ff" }}
              >
                Login Here
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;