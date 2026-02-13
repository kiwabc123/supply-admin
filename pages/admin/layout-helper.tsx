import { ReactNode } from 'react';

export default function AdminLayout({ children}: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">Admin</h2>
        <nav className="space-y-4">
          <a href="/admin" className="block hover:text-gray-300">Dashboard</a>
          <a href="/admin/products" className="block hover:text-gray-300">Products</a>
          <a href="/admin/categories" className="block hover:text-gray-300">Categories</a>
          <a href="/admin/blog" className="block hover:text-gray-300">Blog Posts</a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
