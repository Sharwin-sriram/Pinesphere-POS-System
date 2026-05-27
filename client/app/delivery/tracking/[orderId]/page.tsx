"use client";

import { useParams } from "next/navigation";

import DeliverySidebar from "../../components/DeliverySidebar";
import DeliveryTopbar from "../../components/DeliveryTopbar";
import DeliveryTimeline from "../../components/DeliveryTimeline";

export default function OrderTrackingDetailsPage() {
  const params = useParams();

  return (
    <div className="flex bg-[#f5f7fb] min-h-screen">
      <DeliverySidebar />

      <main className="flex-1 p-6">
        <DeliveryTopbar />

        <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Order Tracking Details
              </h1>

              <p className="text-gray-500 mt-2">
                Tracking ID: {params.orderId}
              </p>
            </div>

            <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full">
              Out for Delivery
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
            <div className="bg-gray-100 rounded-xl p-5">
              <p className="text-gray-500 text-sm">
                Assigned Rider
              </p>

              <h2 className="text-2xl font-bold mt-2">
                Arjun
              </h2>
            </div>

            <div className="bg-gray-100 rounded-xl p-5">
              <p className="text-gray-500 text-sm">
                Estimated Arrival
              </p>

              <h2 className="text-2xl font-bold mt-2">
                18 mins
              </h2>
            </div>

            <div className="bg-gray-100 rounded-xl p-5">
              <p className="text-gray-500 text-sm">
                Payment Method
              </p>

              <h2 className="text-2xl font-bold mt-2">
                UPI
              </h2>
            </div>
          </div>

          <div className="mt-8">
            <DeliveryTimeline />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
            <div className="bg-gray-100 rounded-xl p-5">
              <h2 className="text-xl font-bold">
                Customer Details
              </h2>

              <div className="space-y-3 mt-4">
                <p>
                  Name:
                  <span className="font-semibold ml-2">
                    Rahul Sharma
                  </span>
                </p>

                <p>
                  Address:
                  <span className="font-semibold ml-2">
                    RS Puram, Coimbatore
                  </span>
                </p>

                <p>
                  Phone:
                  <span className="font-semibold ml-2">
                    +91 9876543210
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-gray-100 rounded-xl p-5">
              <h2 className="text-xl font-bold">
                Delivery Notes
              </h2>

              <div className="space-y-3 mt-4 text-gray-600">
                <p>
                  • Leave order at the front gate
                </p>

                <p>
                  • Call customer before arrival
                </p>

                <p>
                  • Delivery proof image placeholder
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}