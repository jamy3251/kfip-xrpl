import ParentClient from "./ParentClient";

export const metadata = {
  title: "부모 한도 설정 — XRP·Family",
  description: "베트남 측에서 자녀 앞으로 월 한도를 XRPL Escrow로 잠급니다.",
};

export default function ParentPage() {
  return <ParentClient />;
}
