// components/IntegrationPartners.tsx

"use client";

export default function IntegrationPartners() {
  return (
    <section className="mt-14">
      <div className="mb-8">
        <p className="text-orange-500 font-semibold uppercase tracking-[3px]">
          Integrations
        </p>

        <h2 className="text-5xl font-black mt-3">
          Platform Integrations ⚡
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
        {[
          "Swiggy",
          "Zomato",
          "Dunzo",
          "ONDC",
          "Uber Eats",
          "Shopify",
        ].map((platform) => (
          <div
            key={platform}
            className="bg-white rounded-[32px] p-8 shadow-sm text-center"
          >
            <h3 className="text-2xl font-black">
              {platform}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}