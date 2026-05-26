"use client";

export default function DeliveryPartnerCard() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-5">
        <img
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
          alt="rider"
          className="w-24 h-24 rounded-3xl object-cover"
        />

        <div>
          <p className="text-gray-500">
            Delivery Partner
          </p>

          <h2 className="text-3xl font-bold mt-2">
            Arun Kumar
          </h2>

          <p className="text-green-600 font-semibold mt-2">
            ⭐ 4.9 Rating
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mt-8">
        <button className="bg-blue-600 hover:bg-blue-700 transition text-white py-4 rounded-2xl font-semibold">
          Call Rider
        </button>

        <button className="border hover:bg-gray-100 transition py-4 rounded-2xl font-semibold">
          Live Chat
        </button>
      </div>
    </div>
  );
}