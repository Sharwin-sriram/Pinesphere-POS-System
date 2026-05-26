type Props = {
  title: string;
  subtitle: string;
};

export default function EmptyState({
  title,
  subtitle,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-6xl mb-4">📦</div>

      <h2 className="text-2xl font-bold text-gray-800">
        {title}
      </h2>

      <p className="text-gray-500 mt-2">
        {subtitle}
      </p>
    </div>
  );
}