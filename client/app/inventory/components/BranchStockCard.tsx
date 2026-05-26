type Props = {
  branches?: {
    id: number;
    name: string;
    stock_value?: string;
  }[];
};

export default function BranchStockCard({
  branches = [],
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-5">
        Branch Stock Value
      </h2>

      {branches.length === 0 ? (
        <p className="text-gray-500">
          Branch inventory data will appear here
        </p>
      ) : (
        <div className="space-y-4">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="flex justify-between"
            >
              <p>{branch.name}</p>

              <p className="font-semibold">
                {branch.stock_value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}