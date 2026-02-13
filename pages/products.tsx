import Layout from '@/components/Layout';

export default function ProductsPage() {
  return (
    <Layout requireAuth={false}>
      <div>
        <h1 className="text-4xl font-bold mb-8">Products</h1>
        
        {/* Search & Filter */}
        <div className="mb-8 flex gap-4">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Search
          </button>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Products Yet</h2>
          <p className="text-gray-600 mb-6">Product listing is coming soon...</p>
          <a
            href="/admin"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    </Layout>
  );
}
