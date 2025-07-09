// src/pages/Auth/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Chrome, CheckCircle, RefreshCw } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const { 
    register: registerUser, 
    loginWithGoogle, 
    emailVerificationSent, 
    setEmailVerificationSent,
    resendVerification 
  } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError,
  } = useForm<RegisterForm>();

  const password = watch('password');

  const checkUsernameUnique = async (username: string): Promise<boolean> => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('name', '==', username)
      );
      const snapshot = await getDocs(usersQuery);
      return snapshot.empty; // Returns true if username is unique
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    try {
      // Check if username is unique
      const isUsernameUnique = await checkUsernameUnique(data.name);
      if (!isUsernameUnique) {
        setError('name', { 
          type: 'manual', 
          message: 'This username is already taken. Please choose a different one.' 
        });
        return;
      }

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
        profileVisibility: 'public', // Default to public profile
      });
    } catch (error: any) {
      if (error.message === 'VERIFICATION_SENT') {
        // Don't show error toast for verification sent
        return;
      }
      toast.error(error.message || 'Registration failed');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome to TeamUp!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResendingVerification(true);
    try {
      await resendVerification();
      toast.success('Verification email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setIsResendingVerification(false);
    }
  };

  // Show verification message if email verification was sent
  if (emailVerificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Check Your Email</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              We've sent a verification link to your email address
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Next steps:</strong>
                </p>
                <ol className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 text-left">
                  <li>1. Check your email inbox</li>
                  <li>2. Click the verification link</li>
                  <li>3. Return here to sign in</li>
                </ol>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isResendingVerification ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 dark:border-gray-300 mr-2"></div>
                      Resending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </button>

                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                >
                  Go to Sign In
                </Link>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>Didn't receive the email? Check your spam folder or try resending.</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setEmailVerificationSent(false);
                window.location.reload();
              }}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-medium"
            >
              ← Back to Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username (must be unique)</label>
              <div className="mt-1 relative">
                <input
                  {...register('name', { 
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Username must be at least 3 characters' },
                    maxLength: { value: 20, message: 'Username must be less than 20 characters' },
                    pattern: {
                      value: /^[a-zA-Z0-9_-]+$/,
                      message: 'Username can only contain letters, numbers, underscores, and hyphens'
                    }
                  })}
                  type="text"
                  className="w-full px-3 py-3 pl-10 border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  placeholder="Choose a unique username"
                />
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This will be your unique identifier that others can use to find and collaborate with you.
              </p>
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
                <option value="designer">Designer</option>
                <option value="product manager">Product Manager</option>
                <option value="entrepreneur">Entrepreneur</option>
                <option value="researcher">Researcher</option>
                <option value="other">Other</option>
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
                placeholder="e.g., JavaScript, React, Python, UI/UX"
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
            className="w-full mt-4 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isGoogleLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 dark:border-gray-300 mr-2"></div>
                    Signing up with Google...
                  </>
                ) : (
                  <>
                    <Chrome className="w-5 h-5 mr-2 text-red-500" />
                    Sign up with Google
                  </>
                )}
              </button>
            </div>
          </div>

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