import Layout from './layout-helper';

export default function AdminDashboard() {
  return (
    <Layout>
      <div>
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Products</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Categories</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Blog Posts</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
