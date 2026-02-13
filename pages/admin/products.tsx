import Layout from './layout-helper';

export default function AdminProductsPage() {
  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Products Management</h1>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Product
          </button>
        </div>
        <p className="text-lg text-gray-600">Product management interface coming soon...</p>
      </div>
    </Layout>
  );
}
