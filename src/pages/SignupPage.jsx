import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { signupSchema } from '../schemas/authSchemas';
import { axiosInstance } from '../api/axiosInstance';
import PageTransition from '../components/PageTransition';

// Staggered entry animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Creating your account...');
    try {
      await axiosInstance.post('/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      toast.success('Account created successfully! Please sign in.', { id: toastId });
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to create account. Email might already be registered.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="flex-grow flex items-center justify-center px-4 py-12 hero-gradient min-h-[calc(100vh-4rem-15rem)]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-md bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden"
        >
          <div className="p-8 sm:p-10">
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                Create an account
              </h2>
              <p className="text-sm text-gray-600">
                Join BookNearMe today and discover your next stay
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white ${
                      errors.name
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-200 focus:ring-brand/20 focus:border-brand'
                    }`}
                    placeholder="John Doe"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.name.message}</p>
                )}
              </motion.div>

              {/* Email Address */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white ${
                      errors.email
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-200 focus:ring-brand/20 focus:border-brand'
                    }`}
                    placeholder="john@example.com"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email.message}</p>
                )}
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`block w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white ${
                      errors.password
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-gray-200 focus:ring-brand/20 focus:border-brand'
                    }`}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password.message}</p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-subtle hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </motion.div>
            </form>

            {/* Footer Links */}
            <motion.div
              variants={itemVariants}
              className="mt-8 text-center text-sm text-gray-600 border-t border-gray-100 pt-6"
            >
              Already have an account?{' '}
              <Link to="/login" className="text-brand hover:underline font-semibold transition-all">
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
