import Layout from '@/components/Layout';

export default function Home() {
  return (
    <Layout requireAuth={false}>
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to Supply Admin</h1>
        <p className="text-xl text-gray-600 mb-8">Manage your products, inventory, and content</p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="/products"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Browse Products
          </a>
          <a
            href="/admin"
            className="px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-medium"
          >
            Admin Dashboard
          </a>
          <a
            href="/login"
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Sign In
          </a>
        </div>

        {/* Feature Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-4xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Management</h2>
            <p className="text-gray-600">Manage your entire product catalog with ease</p>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-4xl mb-4">🖼️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Image Storage</h2>
            <p className="text-gray-600">Store and organize product images in the cloud</p>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Secure & Fast</h2>
            <p className="text-gray-600">Enterprise-grade security with blazing fast performance</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
