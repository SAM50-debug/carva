export interface CategoryContact {
  category: string;
  categoryLabel: string;
  name: string;
  phone: string;
  tel: string;
  designation?: string;
}

export const CATEGORY_CONTACTS: Record<string, CategoryContact> = {
  FINE_ARTS: {
    category: "FINE_ARTS",
    categoryLabel: "Fine Arts",
    name: "Ms. Navdeep Kaur",
    phone: "99147 73092",
    tel: "+919914773092",
  },
  CULTURAL: {
    category: "CULTURAL",
    categoryLabel: "Cultural Arena",
    name: "Ms. Harjeet",
    phone: "97796 29507",
    tel: "+919779629507",
  },
  LITERARY: {
    category: "LITERARY",
    categoryLabel: "Literary Arena",
    name: "Dr. Nizamuddin",
    phone: "86300 50566",
    tel: "+918630050566",
  },
  MEDIA: {
    category: "MEDIA",
    categoryLabel: "Media Club",
    name: "Ms. Anureet",
    phone: "81464 60812",
    tel: "+918146460812",
  },
  TECHNICAL: {
    category: "TECHNICAL",
    categoryLabel: "Technical Arena",
    name: "Dr. R.P. Singh",
    phone: "76968 00183",
    tel: "+917696800183",
  },
  BUSINESS: {
    category: "BUSINESS",
    categoryLabel: "Management & Business",
    name: "Dr. Nidhi",
    phone: "80540 11814",
    tel: "+918054011814",
  },
};

export function getCategoryContact(category: string): CategoryContact | null {
  if (!category) return null;
  const norm = category.toUpperCase().trim().replace(/[\s-]+/g, "_");
  if (CATEGORY_CONTACTS[norm]) return CATEGORY_CONTACTS[norm];
  if (norm.includes("CULTUR")) return CATEGORY_CONTACTS.CULTURAL;
  if (norm.includes("TECH")) return CATEGORY_CONTACTS.TECHNICAL;
  if (norm.includes("BUSINES") || norm.includes("MANAG")) return CATEGORY_CONTACTS.BUSINESS;
  if (norm.includes("FINE") || norm.includes("ART")) return CATEGORY_CONTACTS.FINE_ARTS;
  if (norm.includes("LITER")) return CATEGORY_CONTACTS.LITERARY;
  if (norm.includes("MEDIA")) return CATEGORY_CONTACTS.MEDIA;
  return null;
}
