import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local first (real keys), fall back to .env
dotenv.config({ path: resolve(__dirname, "../.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ─── Location data ────────────────────────────────────────────────────────────

const locations = [
  { name: "Times Square - 42nd St",   location: "Times Square, New York, NY",         lat: 40.7580, lng: -73.9855 },
  { name: "Union Station - Chicago",   location: "Union Station, Chicago, IL",          lat: 41.8786, lng: -87.6399 },
  { name: "Pike Place Market",         location: "Pike Place Market, Seattle, WA",      lat: 47.6088, lng: -122.3411 },
  { name: "Buckhead MARTA",            location: "Buckhead Station, Atlanta, GA",       lat: 33.8484, lng: -84.3603 },
  { name: "Hollywood & Highland",      location: "Hollywood, Los Angeles, CA",          lat: 34.1022, lng: -118.3387 },
  { name: "Logan Airport T2",          location: "Logan Airport, Boston, MA",           lat: 42.3601, lng: -71.0096 },
  { name: "Miami Design District",     location: "Design District, Miami, FL",          lat: 25.8122, lng: -80.1933 },
  { name: "Cherry Creek Mall",         location: "Cherry Creek, Denver, CO",            lat: 39.7159, lng: -104.9506 },
  { name: "Galleria - Houston",        location: "Galleria, Houston, TX",               lat: 29.7388, lng: -95.4614 },
  { name: "Navy Pier Entrance",        location: "Navy Pier, Chicago, IL",              lat: 41.8916, lng: -87.6072 },
  { name: "Fisherman's Wharf",         location: "Fisherman's Wharf, San Francisco, CA", lat: 37.8080, lng: -122.4177 },
  { name: "Country Club Plaza",        location: "Plaza District, Kansas City, MO",     lat: 39.0476, lng: -94.5938 },
  { name: "Peachtree Center",          location: "Peachtree Center, Atlanta, GA",       lat: 33.7590, lng: -84.3880 },
  { name: "Prudential Center",         location: "Back Bay, Boston, MA",                lat: 42.3481, lng: -71.0823 },
];

// ─── Product data ─────────────────────────────────────────────────────────────

const productsData = [
  // Beverages
  { name: "Coca-Cola Classic",      category: "Beverages",      cost: 0.45, price: 2.00 },
  { name: "Diet Coke",              category: "Beverages",      cost: 0.45, price: 2.00 },
  { name: "Sprite",                 category: "Beverages",      cost: 0.45, price: 2.00 },
  { name: "Vitamin Water XXX",      category: "Beverages",      cost: 0.55, price: 2.25 },
  { name: "Arizona Green Tea",      category: "Beverages",      cost: 0.35, price: 1.50 },
  // Energy Drinks
  { name: "Red Bull Original",      category: "Energy Drinks",  cost: 1.20, price: 3.50 },
  { name: "Monster Energy Green",   category: "Energy Drinks",  cost: 1.10, price: 3.25 },
  { name: "5-Hour Energy",          category: "Energy Drinks",  cost: 1.50, price: 4.00 },
  // Chips & Snacks
  { name: "Lays Classic Chips",     category: "Chips & Snacks", cost: 0.35, price: 1.75 },
  { name: "Doritos Nacho Cheese",   category: "Chips & Snacks", cost: 0.35, price: 1.75 },
  { name: "Cheetos Crunchy",        category: "Chips & Snacks", cost: 0.35, price: 1.75 },
  { name: "Pringles Original",      category: "Chips & Snacks", cost: 0.60, price: 2.25 },
  // Candy & Sweets
  { name: "Snickers Bar",           category: "Candy & Sweets", cost: 0.40, price: 1.75 },
  { name: "Kit Kat",                category: "Candy & Sweets", cost: 0.40, price: 1.75 },
  { name: "Reese's PB Cups",        category: "Candy & Sweets", cost: 0.45, price: 1.75 },
  { name: "M&Ms Peanut",            category: "Candy & Sweets", cost: 0.45, price: 1.75 },
  // Water
  { name: "Dasani Water 20oz",      category: "Water",          cost: 0.20, price: 1.50 },
  { name: "Smartwater 1L",          category: "Water",          cost: 0.45, price: 2.50 },
  // Healthy Snacks
  { name: "Nature Valley Granola",  category: "Healthy Snacks", cost: 0.55, price: 2.00 },
  { name: "Kind Bar Almond",        category: "Healthy Snacks", cost: 0.80, price: 2.75 },
  { name: "Trail Mix Original",     category: "Healthy Snacks", cost: 0.60, price: 2.25 },
  // Sports Drinks
  { name: "Gatorade Blue",          category: "Sports Drinks",  cost: 0.55, price: 2.25 },
  { name: "Powerade Orange",        category: "Sports Drinks",  cost: 0.50, price: 2.00 },
  // Coffee
  { name: "Starbucks Frappuccino",  category: "Coffee",         cost: 1.20, price: 3.75 },
  { name: "Nescafe Iced Coffee",    category: "Coffee",         cost: 0.80, price: 2.75 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

/** Peak hours: 11 am–2 pm and 3–5 pm. Dead zone: midnight–5 am. */
function hourWeight(h: number): number {
  if (h >= 11 && h <= 14) return 3.0;
  if (h >= 15 && h <= 17) return 2.5;
  if (h >= 7  && h <= 10) return 1.5;
  if (h >= 18 && h <= 20) return 1.2;
  if (h >= 0  && h <= 5)  return 0.1;
  return 0.8;
}

/** Weekdays > Friday > Weekend. */
function dayWeight(dow: number): number {
  if (dow === 0 || dow === 6) return 0.55; // weekend
  if (dow === 5)              return 1.15; // Friday
  return 1.0;
}

/**
 * Full-year seasonal multiplier.
 * Jan–Mar: post-holiday dip | Apr–Jun: spring pickup
 * Jul–Sep: summer peak      | Oct–Dec: fall/holiday lift
 */
function seasonalWeight(month: number): number {
  if (month <= 2)  return 0.82; // Jan–Mar
  if (month <= 5)  return 1.05; // Apr–Jun
  if (month <= 8)  return 1.28; // Jul–Sep
  return 1.12;                  // Oct–Dec
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🗑  Clearing existing data...");
  for (const table of ["transactions", "machine_events", "slots", "machines", "products", "users"]) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) console.warn(`  Warning clearing ${table}:`, error.message);
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log("👤 Creating owner...");
  const { data: user, error: userErr } = await supabase
    .from("users")
    .insert({ name: "Alex Operator", email: "alex@vendor.com", role: "OWNER" })
    .select("id")
    .single();
  if (userErr) throw userErr;

  // ── Products ───────────────────────────────────────────────────────────────
  console.log("📦 Creating products...");
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .insert(productsData)
    .select("id, name, price, category");
  if (prodErr) throw prodErr;
  console.log(`   ${products!.length} products created.`);

  // ── Machines ───────────────────────────────────────────────────────────────
  console.log("🏧 Creating machines...");

  // Assign performance tiers
  const tiers: string[] = [
    "high", "high", "high", "high",           // 4 high
    "medium", "medium", "medium", "medium", "medium", // 5 medium
    "low", "low", "low",                       // 3 low
    "OFFLINE", "MAINTENANCE",                  // 2 inactive
  ];

  const { data: machines, error: machErr } = await supabase
    .from("machines")
    .insert(
      locations.map((loc, i) => ({
        name:      loc.name,
        location:  loc.location,
        latitude:  loc.lat,
        longitude: loc.lng,
        status:    tiers[i] === "OFFLINE" ? "OFFLINE"
                 : tiers[i] === "MAINTENANCE" ? "MAINTENANCE"
                 : "ONLINE",
        owner_id:  user.id,
      }))
    )
    .select("id, status");
  if (machErr) throw machErr;
  console.log(`   ${machines!.length} machines created.`);

  // ── Slots ──────────────────────────────────────────────────────────────────
  console.log("🔲 Creating slots...");

  // Keep a flat list of machine→product+price mappings for tx generation
  type SlotRef = { machineId: string; productId: string; price: number };
  const machineSlots: SlotRef[] = [];
  const slotsInsert: object[] = [];

  for (let mi = 0; mi < machines!.length; mi++) {
    const machine = machines![mi];
    const tier    = tiers[mi];
    const count   = rand(8, 12);
    const shuffled = [...products!].sort(() => Math.random() - 0.5).slice(0, count);

    for (let si = 0; si < shuffled.length; si++) {
      const maxQty     = rand(10, 20);
      const [lo, hi]   = tier === "high"   ? [0.50, 1.00]
                       : tier === "medium" ? [0.30, 0.80]
                       : tier === "low"    ? [0.05, 0.35]
                       :                    [0.10, 0.60];
      const currentQty = Math.floor(maxQty * randFloat(lo, hi));

      slotsInsert.push({
        position:    si + 1,
        machine_id:  machine.id,
        product_id:  shuffled[si].id,
        current_qty: currentQty,
        max_qty:     maxQty,
      });

      machineSlots.push({
        machineId: machine.id,
        productId: shuffled[si].id,
        price:     shuffled[si].price,
      });
    }
  }

  const { error: slotErr } = await supabase.from("slots").insert(slotsInsert);
  if (slotErr) throw slotErr;
  console.log(`   ${slotsInsert.length} slots created.`);

  // ── Transactions (365 days) ────────────────────────────────────────────────
  console.log("💳 Generating 365 days of transactions...");

  const now       = new Date();
  const yearAgo   = new Date(now);
  yearAgo.setDate(yearAgo.getDate() - 365);

  const allTxs: object[] = [];

  for (let mi = 0; mi < machines!.length; mi++) {
    const machine = machines![mi];
    const tier    = tiers[mi];
    if (tier === "OFFLINE" || tier === "MAINTENANCE") continue;

    const baseDaily = tier === "high" ? 85 : tier === "medium" ? 48 : 22;
    const mySlots   = machineSlots.filter((s) => s.machineId === machine.id);
    if (!mySlots.length) continue;

    const cursor = new Date(yearAgo);
    while (cursor <= now) {
      const dow     = cursor.getDay();
      const month   = cursor.getMonth();
      const daily   = Math.round(
        baseDaily * dayWeight(dow) * seasonalWeight(month) * randFloat(0.72, 1.28)
      );

      for (let t = 0; t < daily; t++) {
        // Weighted random hour
        let hour = 0;
        for (let attempt = 0; attempt < 30; attempt++) {
          const h = rand(6, 22);
          if (Math.random() < hourWeight(h) / 3.0) { hour = h; break; }
        }

        const txDate = new Date(cursor);
        txDate.setHours(hour, rand(0, 59), rand(0, 59), 0);

        const slot = mySlots[rand(0, mySlots.length - 1)];
        const qty  = Math.random() < 0.88 ? 1 : 2;

        allTxs.push({
          machine_id: machine.id,
          product_id: slot.productId,
          quantity:   qty,
          amount:     Math.round(slot.price * qty * 100) / 100,
          created_at: txDate.toISOString(),
        });
      }

      cursor.setDate(cursor.getDate() + 1);
    }
  }

  console.log(`   ${allTxs.length.toLocaleString()} transactions to insert...`);

  const BATCH = 500;
  for (let i = 0; i < allTxs.length; i += BATCH) {
    const { error } = await supabase
      .from("transactions")
      .insert(allTxs.slice(i, i + BATCH));
    if (error) throw error;

    const pct = Math.round(((i + BATCH) / allTxs.length) * 100);
    process.stdout.write(`\r   ${Math.min(i + BATCH, allTxs.length).toLocaleString()} / ${allTxs.length.toLocaleString()}  (${Math.min(pct, 100)}%)`);
  }
  console.log("\n   Done.");

  // ── Machine events ─────────────────────────────────────────────────────────
  console.log("📋 Creating machine events...");

  const eventDetails: Record<string, string[]> = {
    restock:     ["Restocked 3 slots. Added 36 units.", "Full restock — 10 slots refreshed.", "Partial restock: beverages + snacks."],
    error:       ["Card reader malfunction", "Motor jam on slot C3", "Coin acceptor error", "Network timeout", "Bill validator jammed"],
    maintenance: ["Scheduled quarterly maintenance", "Refrigeration unit serviced", "Screen cleaned and calibrated"],
    offline:     ["Machine went offline — power issue", "Network outage at location", "Circuit breaker tripped"],
    online:      ["Machine restored to service", "Power restored after outage", "Reconnected after maintenance"],
  };

  const eventsInsert: object[] = [];
  for (const machine of machines!) {
    const count = rand(12, 30); // More events over a full year
    for (let e = 0; e < count; e++) {
      const daysAgo   = rand(0, 365);
      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() - daysAgo);

      const type    = Object.keys(eventDetails)[rand(0, 4)];
      const options = eventDetails[type];
      eventsInsert.push({
        machine_id: machine.id,
        type,
        details:    options[rand(0, options.length - 1)],
        created_at: eventDate.toISOString(),
      });
    }
  }

  const { error: evErr } = await supabase.from("machine_events").insert(eventsInsert);
  if (evErr) throw evErr;
  console.log(`   ${eventsInsert.length} events created.`);

  console.log("\n✅ Seed complete!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
