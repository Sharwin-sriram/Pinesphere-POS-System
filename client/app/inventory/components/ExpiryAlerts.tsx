type Props = {
  items?: {
    id: number;
    name: string;
    expiry_date: string;
  }[];
};

export default function ExpiryAlerts({
  items = [],
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-5">
        Expiry Alerts
      </h2>

      {items.length === 0 ? (
        <p className="text-gray-500">
          Expiry alerts will appear here
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b pb-3"
            >
              <p>{item.name}</p>

              <p className="text-red-500">
                {item.expiry_date}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}