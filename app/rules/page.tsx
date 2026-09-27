import { Metadata } from "next";
import RulesClient from "./RulesClient";

export const metadata: Metadata = {
  title: "Rules & Guidelines | CARAVAN ’26",
  description: "General Rules and Guidelines for the CARAVAN '26 Inter-University Youth Festival.",
};

export default function RulesPage() {
  return <RulesClient />;
}
