// src/pages/Auth/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  skills: string;
}

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.email, data.password, {
        name: data.name,
        role: data.role,
        skills: data.skills, // keep as string if that's how your profile stores it
        projects: [],        // initialize projects array to prevent crash
        about: '',
        github: '',
        linkedin: '',
        website: '',
        profileImage: '',    // if you add one in future
      });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Join TeamUp</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Create your account and start collaborating</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <div className="mt-1 relative">
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  className="w-full px-3 py-3 pl-10 border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  placeholder="Enter your full name"
                />
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <div className="mt-1 relative">
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                  })}
                  type="email"
                  className="w-full px-3 py-3 pl-10 border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select
                {...register('role', { required: 'Role is required' })}
                className="mt-1 block w-full px-3 py-3 border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg"
              >
                <option value="">Select your role</option>
                <option value="student">Student</option>
                <option value="developer">Developer</option>
                <option value="hacker">Hacker</option>
                <option value="learner">Learner</option>
              </select>
              {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skills (comma-separated)</label>
              <input
                {...register('skills', { required: 'Skills are required' })}
                type="text"
                className="w-full px-3 py-3 border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
                placeholder="e.g., JavaScript, React, Python"
              />
              {errors.skills && <p className="text-sm text-red-500">{errors.skills.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-3 pl-10 pr-10 border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  placeholder="Enter password"
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === password || 'Passwords do not match',
                })}
                type="password"
                className="w-full px-3 py-3 border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
                placeholder="Confirm password"
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 hover:underline dark:text-purple-400">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
