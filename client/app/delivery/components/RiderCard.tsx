"use client";

import { Rider } from "../types/delivery";
import RiderStatusBadge from "./RiderStatusBadge";

interface Props {
  rider: Rider;
}

export default function RiderCard({
  rider,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {rider.name}
          </h2>

          <p className="text-gray-500">
            {rider.phone}
          </p>
        </div>

        <RiderStatusBadge status={rider.status} />
      </div>

      <div className="mt-5 space-y-2 text-sm">
        <p>
          Vehicle:
          <span className="font-semibold ml-2">
            {rider.vehicle}
          </span>
        </p>

        <p>
          Deliveries:
          <span className="font-semibold ml-2">
            {rider.deliveries}
          </span>
        </p>

        <p>
          Earnings:
          <span className="font-semibold ml-2">
            ₹{rider.earnings}
          </span>
        </p>

        <p>
          Rating:
          <span className="font-semibold ml-2">
            ⭐ {rider.rating}
          </span>
        </p>
      </div>
    </div>
  );
}