"use client";

import { useParams } from "next/navigation";
import DeliverySidebar from "../../components/DeliverySidebar";
import DeliveryTopbar from "../../components/DeliveryTopbar";

export default function RiderDetailsPage() {
  const params = useParams();

  return (
    <div className="flex bg-[#f5f7fb] min-h-screen">
      <DeliverySidebar />

      <main className="flex-1 p-6">
        <DeliveryTopbar />

        <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-3xl font-bold">
            Rider Details
          </h1>

          <p className="text-gray-500 mt-2">
            Rider ID: {params?.id}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
            <div className="bg-gray-100 rounded-xl p-5">
              <p className="text-gray-500">
                Total Deliveries
              </p>

              <h2 className="text-3xl font-bold mt-2">
                124
              </h2>
            </div>

            <div className="bg-gray-100 rounded-xl p-5">
              <p className="text-gray-500">
                Earnings
              </p>

              <h2 className="text-3xl font-bold mt-2">
                ₹42,000
              </h2>
            </div>

            <div className="bg-gray-100 rounded-xl p-5">
              <p className="text-gray-500">
                Rating
              </p>

              <h2 className="text-3xl font-bold mt-2">
                ⭐ 4.8
              </h2>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}