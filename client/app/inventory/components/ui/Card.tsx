import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function Card({
  children,
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {children}
    </div>
  );
}