import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, CreditCard, Lock, Shield } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    admissionNumber: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await axios.post('http://localhost:5000/api/auth/register', formData);
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create Account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><User className="h-5 w-5 text-gray-400" /></div>
                <input name="name" type="text" required onChange={handleChange} className="pl-10 block w-full outline-none sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="John Doe" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><Mail className="h-5 w-5 text-gray-400" /></div>
                <input name="email" type="email" required onChange={handleChange} className="pl-10 block w-full outline-none sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="john@srmap.edu.in" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Admission Number</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><CreditCard className="h-5 w-5 text-gray-400" /></div>
                <input name="admissionNumber" type="text" required onChange={handleChange} className="pl-10 block w-full outline-none sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="AP211100..." />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><Lock className="h-5 w-5 text-gray-400" /></div>
                <input name="password" type="password" required onChange={handleChange} className="pl-10 block w-full outline-none sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="••••••••" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><Shield className="h-5 w-5 text-gray-400" /></div>
                <select name="role" onChange={handleChange} className="pl-10 block w-full sm:text-sm border-gray-300 outline-none rounded-md py-2 border bg-white appearance-none text-gray-700 hover:cursor-pointer">
                  <option value="student">Student</option>
                  <option value="lead">Community Lead</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
            {success && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">{success}</div>}

            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:cursor-pointer transition duration-150">
              Sign up
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
