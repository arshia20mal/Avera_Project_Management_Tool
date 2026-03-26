import { drizzle } from "drizzle-orm/better-sqlite3";
import { sites, verticals, subSections, appMeta } from "./schema";
import { eq } from "drizzle-orm";

type Db = ReturnType<typeof drizzle>;

const SITES_DATA = [
  { name: "Avera Nandi", slug: "nandi", location: "Nandi Hills, Karnataka", sortOrder: 1 },
  { name: "Avera Yogavana", slug: "yogavana", location: "Kanakapura, Karnataka", sortOrder: 2 },
  { name: "Avera Chikmagalur", slug: "chikmagalur", location: "Chikmagalur, Karnataka", sortOrder: 3 },
  { name: "Avera Kabini", slug: "kabini", location: "Kabini, Karnataka", sortOrder: 4 },
];

const VERTICALS_DATA: { name: string; sortOrder: number; subSections: string[] }[] = [
  {
    name: "Construction & Civil",
    sortOrder: 1,
    subSections: [
      "Site Preparation & Earthworks",
      "Foundation & Structure (RCC, walls, roofing)",
      "MEP — Mechanical, Electrical & Plumbing",
      "Interiors & Fit-out",
      "Landscaping & Outdoor (gardens, pathways, pools, outdoor structures)",
      "Technology & Systems (PMS, booking engine, WiFi, CCTV, access control)",
    ],
  },
  {
    name: "Licensing & Legal",
    sortOrder: 2,
    subSections: [
      "Environmental & Land Clearances",
      "Fire NOC",
      "Tourism Department Approvals",
      "FSSAI (Food Safety)",
      "Liquor License",
      "Other Statutory Registrations",
    ],
  },
  {
    name: "Interiors & FF&E",
    sortOrder: 3,
    subSections: [
      "Concept & Design Approvals",
      "Procurement (Furniture, Fixtures & Equipment)",
      "Delivery & Installation",
      "Snagging & Final Finishes",
    ],
  },
  {
    name: "HR & Staffing",
    sortOrder: 4,
    subSections: [
      "Org Chart & Positioning (per property)",
      "Recruitment",
      "Training & Onboarding",
      "Uniforms & SOPs",
    ],
  },
  {
    name: "Sales & Marketing",
    sortOrder: 5,
    subSections: [
      "Brand Identity & Guidelines",
      "Website & Digital Presence",
      "OTA Listings (MakeMyTrip, Booking.com, etc.)",
      "PR & Pre-launch Campaigns",
      "Photography & Content",
    ],
  },
  {
    name: "Food & Beverage",
    sortOrder: 6,
    subSections: [
      "Kitchen Equipment & Setup",
      "Menu Development",
      "Supplier & Vendor Tie-ups",
      "Staffing (F&B-specific)",
    ],
  },
  {
    name: "Wellness & Spa",
    sortOrder: 7,
    subSections: [
      "Treatment Menu & Programming",
      "Equipment & Products",
      "Therapist Hiring & Training",
      "Space Setup & Certifications",
    ],
  },
  {
    name: "Pre-opening & Launch",
    sortOrder: 8,
    subSections: [
      "Soft Launch Planning",
      "Snag List Closure",
      "Trial Runs & Rehearsals",
      "Opening Day Coordination",
      "Post-launch Review",
    ],
  },
];

export function seedDatabase(db: Db) {
  // Check if already seeded
  const existing = db.select().from(appMeta).where(eq(appMeta.key, "seeded")).get();
  if (existing) return;

  // Run all inserts in a transaction
  db.transaction((tx) => {
    // Insert sites
    for (const site of SITES_DATA) {
      tx.insert(sites).values(site).run();
    }

    // Insert verticals and their sub-sections
    for (const v of VERTICALS_DATA) {
      const result = tx
        .insert(verticals)
        .values({ name: v.name, sortOrder: v.sortOrder })
        .returning({ id: verticals.id })
        .get();

      for (let i = 0; i < v.subSections.length; i++) {
        tx.insert(subSections)
          .values({
            verticalId: result.id,
            name: v.subSections[i],
            sortOrder: i + 1,
          })
          .run();
      }
    }

    // Mark as seeded
    tx.insert(appMeta).values({ key: "seeded", value: "true" }).run();
  });
}
