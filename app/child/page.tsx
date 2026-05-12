import ChildClient from "./ChildClient";

export const metadata = {
  title: "자녀 지갑 — XRP·Family",
  description: "부모님이 잠가둔 한도로 즉시 결제하세요.",
};

export default function ChildPage() {
  return <ChildClient />;
}
