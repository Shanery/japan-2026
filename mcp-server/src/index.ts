#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";

// ─── Setup ──────────────────────────────────────────────────────
const CONVEX_URL = process.env.CONVEX_URL;
if (!CONVEX_URL) {
  console.error("CONVEX_URL environment variable is required");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);
const server = new McpServer({
  name: "japan-trip-planner",
  version: "1.0.0",
});

// Helper: call a Convex query
async function query(name: string, args: Record<string, unknown> = {}) {
  return await client.query(name as any, args as any);
}

// Helper: call a Convex mutation
async function mutate(name: string, args: Record<string, unknown> = {}) {
  return await client.mutation(name as any, args as any);
}

// ─── DAYS ───────────────────────────────────────────────────────

server.tool(
  "list_days",
  "List all trip days with their details (day number, date, city, summary, region)",
  {},
  async () => {
    const days = await query("days:list");
    return {
      content: [{ type: "text", text: JSON.stringify(days, null, 2) }],
    };
  }
);

server.tool(
  "get_day",
  "Get a specific day by its day number (1-17)",
  { dayNumber: z.number().min(1).max(17).describe("Day number (1-17)") },
  async ({ dayNumber }) => {
    const day = await query("days:getByNumber", { dayNumber });
    if (!day) {
      return { content: [{ type: "text", text: `Day ${dayNumber} not found` }] };
    }
    return { content: [{ type: "text", text: JSON.stringify(day, null, 2) }] };
  }
);

server.tool(
  "update_day",
  "Update a day's city, summary, or region",
  {
    dayNumber: z.number().min(1).max(17).describe("Day number to update"),
    city: z.string().optional().describe("New city name"),
    summary: z.string().optional().describe("New summary"),
    region: z.string().optional().describe("New region (Tokyo, Kyoto, Kyushu)"),
  },
  async ({ dayNumber, city, summary, region }) => {
    const day = await query("days:getByNumber", { dayNumber });
    if (!day) {
      return { content: [{ type: "text", text: `Day ${dayNumber} not found` }] };
    }
    const updates: Record<string, unknown> = { id: day._id };
    if (city !== undefined) updates.city = city;
    if (summary !== undefined) updates.summary = summary;
    if (region !== undefined) updates.region = region;
    await mutate("days:update", updates);
    return {
      content: [{ type: "text", text: `Day ${dayNumber} updated successfully` }],
    };
  }
);

// ─── ACTIVITIES ─────────────────────────────────────────────────

server.tool(
  "list_activities",
  "List all activities for a specific day",
  { dayNumber: z.number().min(1).max(17).describe("Day number (1-17)") },
  async ({ dayNumber }) => {
    const day = await query("days:getByNumber", { dayNumber });
    if (!day) {
      return { content: [{ type: "text", text: `Day ${dayNumber} not found` }] };
    }
    const activities = await query("activities:listByDay", { dayId: day._id });
    return {
      content: [{ type: "text", text: JSON.stringify(activities, null, 2) }],
    };
  }
);

server.tool(
  "add_activity",
  "Add a new activity to a specific day",
  {
    dayNumber: z.number().min(1).max(17).describe("Day number (1-17)"),
    name: z.string().describe("Activity name"),
    type: z.enum(["food", "activity", "logistics", "ticket"]).describe("Activity type"),
    time: z.string().optional().describe("Time of day (e.g. '9:00 AM', 'Morning')"),
    location: z.string().optional().describe("Location name"),
    googleMapsUrl: z.string().optional().describe("Google Maps URL"),
    externalUrl: z.string().optional().describe("External link URL"),
    notes: z.string().optional().describe("Additional notes"),
    isBooked: z.boolean().optional().describe("Whether this is booked/confirmed"),
    order: z.number().optional().describe("Sort order (0-based). If not provided, adds to end."),
  },
  async ({ dayNumber, name, type, time, location, googleMapsUrl, externalUrl, notes, isBooked, order }) => {
    const day = await query("days:getByNumber", { dayNumber });
    if (!day) {
      return { content: [{ type: "text", text: `Day ${dayNumber} not found` }] };
    }

    // Auto-calculate order if not provided
    let activityOrder = order;
    if (activityOrder === undefined) {
      const existing = await query("activities:listByDay", { dayId: day._id });
      activityOrder = (existing as any[]).length;
    }

    const args: Record<string, unknown> = {
      dayId: day._id,
      name,
      type,
      isBooked: isBooked ?? false,
      order: activityOrder,
    };
    if (time !== undefined) args.time = time;
    if (location !== undefined) args.location = location;
    if (googleMapsUrl !== undefined) args.googleMapsUrl = googleMapsUrl;
    if (externalUrl !== undefined) args.externalUrl = externalUrl;
    if (notes !== undefined) args.notes = notes;

    const id = await mutate("activities:create", args);
    return {
      content: [{ type: "text", text: `Activity "${name}" added to Day ${dayNumber} (id: ${id})` }],
    };
  }
);

server.tool(
  "update_activity",
  "Update an existing activity by its ID",
  {
    id: z.string().describe("Activity _id from Convex"),
    name: z.string().optional().describe("Activity name"),
    type: z.enum(["food", "activity", "logistics", "ticket"]).optional().describe("Activity type"),
    time: z.string().optional().describe("Time of day"),
    location: z.string().optional().describe("Location name"),
    googleMapsUrl: z.string().optional().describe("Google Maps URL"),
    externalUrl: z.string().optional().describe("External link URL"),
    notes: z.string().optional().describe("Additional notes"),
    isBooked: z.boolean().optional().describe("Whether this is booked/confirmed"),
    order: z.number().optional().describe("Sort order"),
  },
  async (args) => {
    const updates: Record<string, unknown> = { id: args.id };
    for (const [key, value] of Object.entries(args)) {
      if (key !== "id" && value !== undefined) {
        updates[key] = value;
      }
    }
    await mutate("activities:update", updates);
    return {
      content: [{ type: "text", text: `Activity ${args.id} updated successfully` }],
    };
  }
);

server.tool(
  "delete_activity",
  "Delete an activity by its ID",
  { id: z.string().describe("Activity _id from Convex") },
  async ({ id }) => {
    await mutate("activities:remove", { id });
    return { content: [{ type: "text", text: `Activity ${id} deleted` }] };
  }
);

// ─── BUDGET ─────────────────────────────────────────────────────

server.tool(
  "list_budget",
  "List all budget items, optionally filtered by category",
  {
    category: z.string().optional().describe("Filter by category: flights, hotels, transport, food, activities, shopping, other"),
  },
  async ({ category }) => {
    let items;
    if (category) {
      items = await query("budget:listByCategory", { category });
    } else {
      items = await query("budget:list");
    }
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
    };
  }
);

server.tool(
  "get_budget_totals",
  "Get budget totals and summary (total AUD, total JPY, paid, remaining)",
  {},
  async () => {
    const totals = await query("budget:getTotals");
    return {
      content: [{ type: "text", text: JSON.stringify(totals, null, 2) }],
    };
  }
);

server.tool(
  "add_budget_item",
  "Add a new budget item",
  {
    category: z.string().describe("Category: flights, hotels, transport, food, activities, shopping, other"),
    description: z.string().describe("Description of the expense"),
    amountAUD: z.number().optional().describe("Amount in AUD"),
    amountJPY: z.number().optional().describe("Amount in JPY"),
    isPaid: z.boolean().optional().describe("Whether this is already paid"),
    dayNumber: z.number().optional().describe("Associated day number"),
    notes: z.string().optional().describe("Additional notes"),
    activityId: z.string().optional().describe("Linked activity _id (optional)"),
  },
  async ({ category, description, amountAUD, amountJPY, isPaid, dayNumber, notes, activityId }) => {
    const args: Record<string, unknown> = {
      category,
      description,
      isPaid: isPaid ?? false,
    };
    if (amountAUD !== undefined) args.amountAUD = amountAUD;
    if (amountJPY !== undefined) args.amountJPY = amountJPY;
    if (dayNumber !== undefined) args.dayNumber = dayNumber;
    if (notes !== undefined) args.notes = notes;
    if (activityId !== undefined) args.activityId = activityId;

    const id = await mutate("budget:create", args);
    return {
      content: [{ type: "text", text: `Budget item "${description}" added (id: ${id})` }],
    };
  }
);

server.tool(
  "update_budget_item",
  "Update an existing budget item by its ID",
  {
    id: z.string().describe("Budget item _id from Convex"),
    category: z.string().optional().describe("Category"),
    description: z.string().optional().describe("Description"),
    amountAUD: z.number().optional().describe("Amount in AUD"),
    amountJPY: z.number().optional().describe("Amount in JPY"),
    isPaid: z.boolean().optional().describe("Whether this is paid"),
    dayNumber: z.number().optional().describe("Associated day number"),
    notes: z.string().optional().describe("Additional notes"),
    activityId: z.string().optional().describe("Linked activity _id"),
  },
  async (args) => {
    const updates: Record<string, unknown> = { id: args.id };
    for (const [key, value] of Object.entries(args)) {
      if (key !== "id" && value !== undefined) {
        updates[key] = value;
      }
    }
    await mutate("budget:update", updates);
    return {
      content: [{ type: "text", text: `Budget item ${args.id} updated` }],
    };
  }
);

server.tool(
  "delete_budget_item",
  "Delete a budget item by its ID",
  { id: z.string().describe("Budget item _id from Convex") },
  async ({ id }) => {
    await mutate("budget:remove", { id });
    return { content: [{ type: "text", text: `Budget item ${id} deleted` }] };
  }
);

// ─── TRAVEL INFO ────────────────────────────────────────────────

server.tool(
  "list_travel_info",
  "List all travel information (flights, trains, hotels, car hire)",
  {},
  async () => {
    const info = await query("travelInfo:list");
    // Parse JSON details for readability
    const parsed = (info as any[]).map((item: any) => ({
      ...item,
      details: JSON.parse(item.details),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(parsed, null, 2) }],
    };
  }
);

server.tool(
  "add_travel_info",
  "Add travel information (flight, train, hotel, or car hire)",
  {
    type: z.enum(["flight", "train", "hotel", "car"]).describe("Type of travel"),
    title: z.string().describe("Title (e.g. 'Outbound Flight MEL→NRT')"),
    details: z.string().describe("JSON string with all details"),
    bookingReference: z.string().optional().describe("Booking reference code"),
    confirmationNumber: z.string().optional().describe("Confirmation number"),
    dayNumber: z.number().optional().describe("Associated day number"),
    order: z.number().optional().describe("Sort order"),
  },
  async ({ type, title, details, bookingReference, confirmationNumber, dayNumber, order }) => {
    const args: Record<string, unknown> = {
      type,
      title,
      details,
      order: order ?? 0,
    };
    if (bookingReference !== undefined) args.bookingReference = bookingReference;
    if (confirmationNumber !== undefined) args.confirmationNumber = confirmationNumber;
    if (dayNumber !== undefined) args.dayNumber = dayNumber;

    const id = await mutate("travelInfo:create", args);
    return {
      content: [{ type: "text", text: `Travel info "${title}" added (id: ${id})` }],
    };
  }
);

server.tool(
  "update_travel_info",
  "Update travel information by its ID",
  {
    id: z.string().describe("Travel info _id from Convex"),
    title: z.string().optional().describe("Title"),
    details: z.string().optional().describe("JSON string with details"),
    bookingReference: z.string().optional().describe("Booking reference"),
    confirmationNumber: z.string().optional().describe("Confirmation number"),
    dayNumber: z.number().optional().describe("Day number"),
    order: z.number().optional().describe("Sort order"),
  },
  async (args) => {
    const updates: Record<string, unknown> = { id: args.id };
    for (const [key, value] of Object.entries(args)) {
      if (key !== "id" && value !== undefined) {
        updates[key] = value;
      }
    }
    await mutate("travelInfo:update", updates);
    return {
      content: [{ type: "text", text: `Travel info ${args.id} updated` }],
    };
  }
);

// ─── SETTINGS ───────────────────────────────────────────────────

server.tool(
  "get_exchange_rate",
  "Get the current AUD to JPY exchange rate",
  {},
  async () => {
    const rate = await query("settings:getExchangeRate");
    return {
      content: [{ type: "text", text: `Current exchange rate: 1 AUD = ${rate} JPY` }],
    };
  }
);

server.tool(
  "set_exchange_rate",
  "Update the AUD to JPY exchange rate",
  { rate: z.number().positive().describe("New exchange rate (e.g. 100 means 1 AUD = 100 JPY)") },
  async ({ rate }) => {
    await mutate("settings:set", { key: "exchangeRate", value: String(rate) });
    return {
      content: [{ type: "text", text: `Exchange rate updated to 1 AUD = ${rate} JPY` }],
    };
  }
);

// ─── SEED ───────────────────────────────────────────────────────

server.tool(
  "seed_trip_data",
  "Re-seed the database with initial trip data (WARNING: clears existing data first)",
  {},
  async () => {
    const result = await mutate("seed:seedTrip");
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ─── Start Server ───────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Japan Trip MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
