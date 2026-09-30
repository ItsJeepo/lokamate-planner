export type Activity = {
  time: string;
  title: string;
  location: string;
  description: string;
  cost: number;
};

export type ItineraryDay = {
  day: number;
  title: string;
  morning: Activity[];
  afternoon: Activity[];
  evening: Activity[];
};

export type CostItem = { label: string; amount: number };

export type Stay = { name: string; area: string; pricePerNight: number; why: string };

export type FoodItem = { name: string; where: string; price: number; why: string };

export type ItineraryResult = {
  title: string;
  summary: string;
  city: string;
  days: ItineraryDay[];
  costs: {
    items: CostItem[];
    total: number;
    note: string;
  };
  stays: Stay[];
  food: FoodItem[];
  tips: {
    transport: string[];
    bestTime: string;
    packing: string[];
    watchOut: string[];
  };
};

export type ItineraryRecord = {
  id: string;
  city: string;
  style: string;
  budget: number;
  days: number;
  notes: string | null;
  created_at: string;
  result: ItineraryResult;
};

export type TripDraft = {
  style: string;
  city: string;
  budget: number;
  days: number;
  notes: string;
  lang: "id" | "en";
};

export const DRAFT_KEY = "tripmate.draft";
