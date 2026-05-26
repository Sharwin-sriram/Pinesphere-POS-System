"use client";

import ContactlessBanner from "./components/ContactlessBanner";
import DeliveryAppsIntegration from "./components/DeliveryAppsIntegration";
import HeroBanner from "./components/HeroBanner";
import MobileAppBanner from "./components/MobileAppBanner";
import Navbar from "./components/Navbar";
import PopularCategories from "./components/PopularCategories";
import QRCodeOrdering from "./components/QRCodeOrdering";
import RecommendedItems from "./components/RecommendedItems";
import RealtimeOrdersBanner from "./components/RealtimeOrdersBanner";
import SearchBar from "./components/SearchBar";
import SelfOrderKiosk from "./components/SelfOrderKiosk";

export default function OrderingHomePage() {
  return (
    <div className="min-h-screen bg-[#f6f6f6] pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6">
        <HeroBanner />

        <SearchBar />

        <RealtimeOrdersBanner
          activeOrders={0}
          preparing={0}
          ready={0}
          delivered={0}
          cancelled={0}
        />

        <div className="mt-12">
          <ContactlessBanner />
        </div>

        <div className="mt-12">
          <QRCodeOrdering />
        </div>

        <div className="mt-12">
          <SelfOrderKiosk />
        </div>

        <div className="mt-12">
          <PopularCategories />
        </div>

        <div className="mt-12">
          <RecommendedItems />
        </div>

        <div className="mt-12">
          <MobileAppBanner />
        </div>

        <div className="mt-12">
          <DeliveryAppsIntegration />
        </div>
      </main>
    </div>
  );
}