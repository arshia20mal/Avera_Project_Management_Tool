import { db } from "./index";
import { tasks, payments, siteVisits, taskUpdates } from "./schema";

// Demo tasks — realistic for a resort pre-opening
const DEMO_TASKS = [
  // ── Avera Nandi (site 1) — highest priority, most tasks ──
  { title: "Complete electrical wiring for Block A", siteId: 1, verticalId: 1, subSectionId: 3, status: "in_progress", priority: "high", dueDate: "2026-03-20", assignedTo: "Rajesh Kumar", notes: "Waiting on cable delivery. Vendor confirmed 12 Apr." },
  { title: "Install CCTV cameras across main entrance and lobby", siteId: 1, verticalId: 1, subSectionId: 6, status: "not_started", priority: "high", dueDate: "2026-03-25", assignedTo: "SecureTech Systems", notes: "16 cameras ordered. Delivery expected 22 Mar." },
  { title: "Finish roofing for villas 3-6", siteId: 1, verticalId: 1, subSectionId: 2, status: "in_progress", priority: "high", dueDate: "2026-03-18", assignedTo: "Ganesh Constructions", notes: "Delayed due to rain last week" },
  { title: "Complete swimming pool tiling", siteId: 1, verticalId: 1, subSectionId: 5, status: "in_progress", priority: "high", dueDate: "2026-03-22", assignedTo: "AquaBuild", notes: "Tiles stuck in transit from Morbi. Escalated with logistics." },
  { title: "Fire NOC application submission", siteId: 1, verticalId: 2, subSectionId: 8, status: "in_progress", priority: "high", dueDate: "2026-03-19", assignedTo: "Advocate Suresh", notes: "Documentation 90% ready. Need updated building plan from architect." },
  { title: "FSSAI license application", siteId: 1, verticalId: 2, subSectionId: 10, status: "not_started", priority: "medium", dueDate: "2026-04-05", assignedTo: "Priya (Legal)", notes: "Can only apply once kitchen layout is finalized" },
  { title: "Tourism department registration", siteId: 1, verticalId: 2, subSectionId: 9, status: "completed", priority: "medium", dueDate: "2026-03-10", assignedTo: "Priya (Legal)", notes: "Approved on 8 Mar" },
  { title: "Liquor license — initial consultation", siteId: 1, verticalId: 2, subSectionId: 11, status: "not_started", priority: "low", dueDate: "2026-04-15", assignedTo: "Advocate Suresh" },
  { title: "Finalize lobby furniture selection", siteId: 1, verticalId: 3, subSectionId: 14, status: "in_progress", priority: "high", dueDate: "2026-03-26", assignedTo: "Anita (Interior Designer)", notes: "Shortlisted 3 vendors. Need promoter sign-off on fabric swatches." },
  { title: "Procure bed linens and towels (all villas)", siteId: 1, verticalId: 3, subSectionId: 14, status: "not_started", priority: "medium", dueDate: "2026-04-10", assignedTo: "Anita (Interior Designer)" },
  { title: "Snagging walk-through for villas 1-2", siteId: 1, verticalId: 3, subSectionId: 16, status: "not_started", priority: "medium", dueDate: "2026-04-01", assignedTo: "Site PM — Vikram" },
  { title: "Draft org chart for Nandi property", siteId: 1, verticalId: 4, subSectionId: 17, status: "completed", priority: "medium", dueDate: "2026-03-05", assignedTo: "HR — Meena" },
  { title: "Hire head chef for Nandi", siteId: 1, verticalId: 4, subSectionId: 18, status: "in_progress", priority: "high", dueDate: "2026-03-28", assignedTo: "HR — Meena", notes: "2 candidates shortlisted. Interviews scheduled for 24 Mar." },
  { title: "Recruit housekeeping staff (6 positions)", siteId: 1, verticalId: 4, subSectionId: 18, status: "not_started", priority: "medium", dueDate: "2026-04-15", assignedTo: "HR — Meena" },
  { title: "Website content — Nandi property page", siteId: 1, verticalId: 5, subSectionId: 23, status: "in_progress", priority: "medium", dueDate: "2026-03-30", assignedTo: "NowMedia" },
  { title: "OTA listing setup — MakeMyTrip & Booking.com", siteId: 1, verticalId: 5, subSectionId: 24, status: "not_started", priority: "medium", dueDate: "2026-04-20", assignedTo: "Revenue Manager" },
  { title: "Professional property photoshoot", siteId: 1, verticalId: 5, subSectionId: 26, status: "not_started", priority: "high", dueDate: "2026-04-25", assignedTo: "NowMedia", notes: "Can only shoot once interiors are complete" },
  { title: "Kitchen equipment procurement", siteId: 1, verticalId: 6, subSectionId: 27, status: "in_progress", priority: "high", dueDate: "2026-03-30", assignedTo: "Chef Raman (Consultant)", notes: "Main equipment ordered. Smallwares list pending." },
  { title: "Develop opening menu", siteId: 1, verticalId: 6, subSectionId: 28, status: "not_started", priority: "medium", dueDate: "2026-04-10", assignedTo: "Chef Raman (Consultant)" },
  { title: "Soft launch date planning", siteId: 1, verticalId: 8, subSectionId: 35, status: "not_started", priority: "high", dueDate: "2026-04-20", assignedTo: "Promoter", notes: "Target: May 15 soft launch" },
  { title: "Prepare snag list template", siteId: 1, verticalId: 8, subSectionId: 36, status: "completed", priority: "low", dueDate: "2026-03-12", assignedTo: "Site PM — Vikram" },

  // ── Avera Yogavana (site 2) — wellness focused ──
  { title: "Complete yoga pavilion structure", siteId: 2, verticalId: 1, subSectionId: 2, status: "in_progress", priority: "high", dueDate: "2026-04-05", assignedTo: "BuildCraft Pvt Ltd", notes: "Foundation complete. Walls going up this week." },
  { title: "Landscape design approval", siteId: 2, verticalId: 1, subSectionId: 5, status: "in_progress", priority: "medium", dueDate: "2026-03-28", assignedTo: "Green Thumb Landscaping" },
  { title: "Environmental clearance follow-up", siteId: 2, verticalId: 2, subSectionId: 7, status: "in_progress", priority: "high", dueDate: "2026-03-15", assignedTo: "Advocate Suresh", notes: "Awaiting response from KSPCB. Called twice this week." },
  { title: "PMS system selection", siteId: 2, verticalId: 1, subSectionId: 6, status: "not_started", priority: "medium", dueDate: "2026-04-30", assignedTo: "IT Consultant" },
  { title: "Spa treatment menu development", siteId: 2, verticalId: 7, subSectionId: 31, status: "in_progress", priority: "medium", dueDate: "2026-04-15", assignedTo: "Wellness Director — TBD" },
  { title: "Source Ayurvedic products vendor", siteId: 2, verticalId: 7, subSectionId: 32, status: "not_started", priority: "medium", dueDate: "2026-04-20", assignedTo: "Wellness Director — TBD" },
  { title: "Hire 3 therapists", siteId: 2, verticalId: 7, subSectionId: 33, status: "not_started", priority: "medium", dueDate: "2026-05-01", assignedTo: "HR — Meena" },
  { title: "Brand guidelines adaptation for Yogavana", siteId: 2, verticalId: 5, subSectionId: 22, status: "completed", priority: "low", dueDate: "2026-03-01", assignedTo: "NowMedia" },

  // ── Avera Chikmagalur (site 3) — early stage ──
  { title: "Site clearing and leveling", siteId: 3, verticalId: 1, subSectionId: 1, status: "in_progress", priority: "high", dueDate: "2026-04-15", assignedTo: "JK Constructions" },
  { title: "Architect drawings — final revision", siteId: 3, verticalId: 1, subSectionId: 2, status: "in_progress", priority: "high", dueDate: "2026-03-25", assignedTo: "Studio Lotus", notes: "Rev 3 submitted. Minor changes requested." },
  { title: "Land title verification", siteId: 3, verticalId: 2, subSectionId: 7, status: "completed", priority: "high", dueDate: "2026-02-28", assignedTo: "Legal Team" },
  { title: "Environmental impact assessment", siteId: 3, verticalId: 2, subSectionId: 7, status: "not_started", priority: "medium", dueDate: "2026-05-01", assignedTo: "EcoSurvey Consultants" },

  // ── Avera Kabini (site 4) — earliest stage ──
  { title: "Finalize land acquisition paperwork", siteId: 4, verticalId: 2, subSectionId: 7, status: "in_progress", priority: "high", dueDate: "2026-04-01", assignedTo: "Advocate Suresh", notes: "Last 2 documents pending from seller" },
  { title: "Appoint project manager for Kabini", siteId: 4, verticalId: 4, subSectionId: 17, status: "not_started", priority: "high", dueDate: "2026-04-10", assignedTo: "HR — Meena" },
  { title: "Initial site survey and soil testing", siteId: 4, verticalId: 1, subSectionId: 1, status: "not_started", priority: "medium", dueDate: "2026-04-20", assignedTo: "TBD" },
];

const DEMO_PAYMENTS = [
  // Nandi payments
  { vendor: "Ganesh Constructions", amount: 4500000, siteId: 1, verticalId: 1, paymentDate: "2026-02-15", status: "paid", notes: "Milestone 3 — roofing phase" },
  { vendor: "Ganesh Constructions", amount: 2800000, siteId: 1, verticalId: 1, paymentDate: "2026-03-10", status: "paid", notes: "Milestone 4 — interiors rough work" },
  { vendor: "Ganesh Constructions", amount: 3200000, siteId: 1, verticalId: 1, paymentDate: "2026-04-01", status: "pending", notes: "Milestone 5 — pending completion" },
  { vendor: "SecureTech Systems", amount: 850000, siteId: 1, verticalId: 1, paymentDate: "2026-03-20", status: "pending", notes: "CCTV system — advance payment" },
  { vendor: "AquaBuild", amount: 1200000, siteId: 1, verticalId: 1, paymentDate: "2026-03-05", status: "paid", notes: "Pool construction — 60% payment" },
  { vendor: "AquaBuild", amount: 800000, siteId: 1, verticalId: 1, paymentDate: "2026-04-10", status: "pending", notes: "Pool — balance on completion" },
  { vendor: "Anita Interiors", amount: 1800000, siteId: 1, verticalId: 3, paymentDate: "2026-03-01", status: "paid", notes: "Furniture procurement advance" },
  { vendor: "Anita Interiors", amount: 2200000, siteId: 1, verticalId: 3, paymentDate: "2026-04-05", status: "pending", notes: "Balance on delivery" },
  { vendor: "Advocate Suresh", amount: 150000, siteId: 1, verticalId: 2, paymentDate: "2026-02-20", status: "paid", notes: "Legal retainer Q1" },
  { vendor: "NowMedia", amount: 350000, siteId: 1, verticalId: 5, paymentDate: "2026-03-15", status: "paid", notes: "Website design & content — Phase 1" },
  { vendor: "Chef Raman (Consultant)", amount: 200000, siteId: 1, verticalId: 6, paymentDate: "2026-03-01", status: "paid", notes: "Kitchen consultancy fee" },
  { vendor: "Kitchen Equipment Co", amount: 2500000, siteId: 1, verticalId: 6, paymentDate: "2026-03-25", status: "pending", notes: "Commercial kitchen equipment — advance" },

  // Yogavana payments
  { vendor: "BuildCraft Pvt Ltd", amount: 5500000, siteId: 2, verticalId: 1, paymentDate: "2026-02-01", status: "paid", notes: "Foundation work complete" },
  { vendor: "BuildCraft Pvt Ltd", amount: 3000000, siteId: 2, verticalId: 1, paymentDate: "2026-03-15", status: "paid", notes: "Structure milestone 2" },
  { vendor: "BuildCraft Pvt Ltd", amount: 4000000, siteId: 2, verticalId: 1, paymentDate: "2026-04-15", status: "pending", notes: "Structure milestone 3" },
  { vendor: "Green Thumb Landscaping", amount: 600000, siteId: 2, verticalId: 1, paymentDate: "2026-03-10", status: "paid", notes: "Landscape design + initial planting" },
  { vendor: "NowMedia", amount: 150000, siteId: 2, verticalId: 5, paymentDate: "2026-02-15", status: "paid", notes: "Brand adaptation for Yogavana" },

  // Chikmagalur payments
  { vendor: "JK Constructions", amount: 2000000, siteId: 3, verticalId: 1, paymentDate: "2026-03-01", status: "paid", notes: "Site clearing advance" },
  { vendor: "Studio Lotus", amount: 800000, siteId: 3, verticalId: 1, paymentDate: "2026-02-10", status: "paid", notes: "Architecture design fee — Phase 1" },
  { vendor: "Studio Lotus", amount: 400000, siteId: 3, verticalId: 1, paymentDate: "2026-04-01", status: "pending", notes: "Architecture — final drawings" },
  { vendor: "EcoSurvey Consultants", amount: 250000, siteId: 3, verticalId: 2, paymentDate: "2026-04-15", status: "pending", notes: "EIA assessment fee" },

  // Kabini payments
  { vendor: "Land Seller — K.R. Gowda", amount: 8000000, siteId: 4, verticalId: 2, paymentDate: "2026-01-15", status: "paid", notes: "Land advance — 40%" },
  { vendor: "Land Seller — K.R. Gowda", amount: 12000000, siteId: 4, verticalId: 2, paymentDate: "2026-04-01", status: "pending", notes: "Land balance — 60%" },
  { vendor: "Advocate Suresh", amount: 100000, siteId: 4, verticalId: 2, paymentDate: "2026-02-01", status: "paid", notes: "Kabini land documentation" },
];

const DEMO_VISITS = [
  // Past visits
  { siteId: 1, visitDate: "2026-03-05", visitType: "completed", purpose: "Foundation inspection", notes: "All on track. Minor rework needed on villa 3 foundation." },
  { siteId: 1, visitDate: "2026-03-12", visitType: "completed", purpose: "Roofing progress review", notes: "Villas 1-2 complete. 3-6 delayed due to rain." },
  { siteId: 2, visitDate: "2026-03-08", visitType: "completed", purpose: "Yoga pavilion site review", notes: "Location approved. Cleared for construction start." },
  { siteId: 3, visitDate: "2026-03-10", visitType: "completed", purpose: "Architect walkthrough", notes: "Walked the site with Studio Lotus team. Finalized building positions." },
  { siteId: 1, visitDate: "2026-03-18", visitType: "completed", purpose: "Electrical & plumbing check", notes: "MEP contractor walk-through. Identified wiring delays in Block A." },
  // Planned visits
  { siteId: 1, visitDate: "2026-03-25", visitType: "planned", purpose: "Interior design review with Anita", notes: "Review fabric samples and lobby furniture options." },
  { siteId: 1, visitDate: "2026-03-28", visitType: "planned", purpose: "Chef candidate interviews on-site", notes: "2 candidates visiting the property" },
  { siteId: 2, visitDate: "2026-03-27", visitType: "planned", purpose: "Landscape plan walkthrough" },
  { siteId: 4, visitDate: "2026-03-30", visitType: "planned", purpose: "Land paperwork signing", notes: "Meeting with K.R. Gowda and advocate" },
  { siteId: 1, visitDate: "2026-04-02", visitType: "planned", purpose: "Pool tiling inspection" },
  { siteId: 3, visitDate: "2026-04-05", visitType: "planned", purpose: "Site clearing progress check" },
  { siteId: 1, visitDate: "2026-04-10", visitType: "planned", purpose: "Snag walk-through villas 1-2" },
  { siteId: 2, visitDate: "2026-04-12", visitType: "planned", purpose: "Yoga pavilion progress review" },
];

// Demo task updates — realistic timeline entries for a few tasks
const DEMO_TASK_UPDATES = [
  // Task 1: "Complete electrical wiring for Block A"
  { taskId: 1, content: "Initial order placed with SecureTech. Expected delivery in 2 weeks.", createdAt: "2026-03-10 09:30:00" },
  { taskId: 1, content: "Vendor confirmed delivery of electrical cables for next week. Tracking number shared.", createdAt: "2026-03-17 14:15:00" },
  { taskId: 1, content: "Checked on-site today — wiring 60% complete. Remaining cables expected by Friday.", createdAt: "2026-03-21 11:00:00" },

  // Task 3: "Finish roofing for villas 3-6"
  { taskId: 3, content: "Roofing materials delivered to site. Work starting tomorrow.", createdAt: "2026-03-08 16:00:00" },
  { taskId: 3, content: "Rain delay — lost 3 days. Ganesh team will work weekends to catch up.", createdAt: "2026-03-14 10:30:00" },
  { taskId: 3, content: "Villas 3-4 roofing complete. Moving to 5-6 now.", createdAt: "2026-03-20 17:45:00" },

  // Task 4: "Complete swimming pool tiling"
  { taskId: 4, content: "Tiles dispatched from Morbi. Expected arrival in 5 days.", createdAt: "2026-03-12 09:00:00" },
  { taskId: 4, content: "Tiles stuck at Hubli checkpoint — logistics issue. Escalating.", createdAt: "2026-03-18 15:30:00" },

  // Task 5: "Fire NOC application submission"
  { taskId: 5, content: "Documentation started. Collecting all building plans from architect.", createdAt: "2026-03-06 10:00:00" },
  { taskId: 5, content: "90% ready. Waiting on updated floor plan from Studio Lotus.", createdAt: "2026-03-16 11:30:00" },

  // Task 13: "Hire head chef for Nandi"
  { taskId: 13, content: "Posted job listing on HospitalityJobs and LinkedIn.", createdAt: "2026-03-05 09:00:00" },
  { taskId: 13, content: "Received 12 applications. Screening in progress.", createdAt: "2026-03-12 14:00:00" },
  { taskId: 13, content: "Shortlisted 2 candidates. Scheduling on-site interviews for Mar 24.", createdAt: "2026-03-19 16:30:00" },
];

export function seedDemoData() {
  db.transaction((tx) => {
    for (const task of DEMO_TASKS) {
      tx.insert(tasks).values(task as any).run();
    }
    for (const payment of DEMO_PAYMENTS) {
      tx.insert(payments).values(payment as any).run();
    }
    for (const visit of DEMO_VISITS) {
      tx.insert(siteVisits).values(visit as any).run();
    }
    for (const update of DEMO_TASK_UPDATES) {
      tx.insert(taskUpdates).values(update as any).run();
    }
  });
}
