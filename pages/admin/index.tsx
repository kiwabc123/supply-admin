import React from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <Layout requireAuth={true}>
      <div>
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome, {user?.name}! 👋</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-blue-600">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900 font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-gray-900 font-medium">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p className="text-gray-900 font-medium text-sm truncate">{user?.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-gray-900 font-medium">{user?.name}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📦 Products</h3>
            <p className="text-3xl font-bold text-blue-600 mb-2">0</p>
            <a href="/products" className="text-blue-600 hover:text-blue-700 text-sm">
              View all →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📚 Categories</h3>
            <p className="text-3xl font-bold text-green-600 mb-2">0</p>
            <a href="#" className="text-green-600 hover:text-green-700 text-sm">
              Manage →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📰 Blog Posts</h3>
            <p className="text-3xl font-bold text-purple-600 mb-2">0</p>
            <a href="#" className="text-purple-600 hover:text-purple-700 text-sm">
              View all →
            </a>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium">
              + Add Product
            </button>
            <button className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium">
              + New Category
            </button>
            <button className="bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium">
              + Write Blog Post
            </button>
            <button className="bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition font-medium">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
