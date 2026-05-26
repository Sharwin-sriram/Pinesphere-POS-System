"use client";

const databases = [
  {
    name: "PostgreSQL",
    schema: "shared_schema",
    status: "Connected",
  },

  {
    name: "PostgreSQL",
    schema: "node_schema",
    status: "Connected",
  },

  {
    name: "MongoDB",
    schema: "analytics_logs",
    status: "Connected",
  },

  {
    name: "Redis Cache",
    schema: "live_sessions",
    status: "Active",
  },
];

export default function DatabaseConnectionsPanel() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm mt-10">
      <div className="mb-8">
        <p className="text-blue-600 font-semibold">
          Infrastructure
        </p>

        <h2 className="text-4xl font-bold mt-2">
          Database Connections 🗄️
        </h2>
      </div>

      <div className="space-y-5">
        {databases.map((db) => (
          <div
            key={db.schema}
            className="border rounded-2xl p-5 flex items-center justify-between"
          >
            <div>
              <h3 className="font-bold text-xl">
                {db.name}
              </h3>

              <p className="text-gray-500 mt-1">
                {db.schema}
              </p>
            </div>

            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-2xl font-semibold">
              {db.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}