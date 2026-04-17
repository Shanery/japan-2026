import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient("https://incredible-civet-622.convex.cloud");

// Cost data: map of dayNumber -> array of { nameMatch, costAUD, costJPY }
const costUpdates = [
  // Day 3: Izu
  { day: 3, match: "Saphir Odoriko", costAUD: 176, costJPY: 20120, notes: "Green Class ¥10,060/person. Premium sightseeing train from Tokyo to Izu Peninsula, ~2.5hrs" },
  { day: 3, match: "Mount Omuro", costAUD: 18, costJPY: 2000, notes: "Chairlift ¥1,000/person roundtrip (walking up prohibited). 6-min ride to crater rim with 360° views." },

  // Day 4: Disney Sea
  { day: 4, match: "DisneySea", costAUD: 191, costJPY: 21800, notes: "~¥10,900/person (peak pricing for Jun 4 weekday). Dynamic pricing: ¥7,900-¥10,900. Key areas: Mediterranean Harbor, Mysterious Island, Mermaid Lagoon, Arabian Coast" },

  // Day 5: Hakone
  { day: 5, match: "Travel to Hakone", costAUD: 125, costJPY: 14200, notes: "Hakone Free Pass ¥7,100/person from Shinjuku. Includes: Odakyu train roundtrip, Tozan Railway, cable car, ropeway, Lake Ashinoko pirate ship, local buses. Covers all Day 5 transport." },

  // Day 6: Shopping
  { day: 6, match: "Capybara", costAUD: 49, costJPY: 5600, notes: "CapyNeko Kichijoji ¥2,800/person (50min) or Cafe Capyba Sumida ¥1,450/person (30min). Reservation required — opens 2 weeks before." },
  { day: 6, match: "Samoyed", costAUD: 70, costJPY: 8000, notes: "~¥4,000/person for 1hr at Moffu Harajuku. Includes drinks. Extra dog treats ¥500. Reservation recommended." },
  { day: 6, match: "Glass Cutting", costAUD: 72, costJPY: 8260, notes: "Edo Kiriko workshop ¥3,630/person + ~¥500 glass selection. 90min in Asakusa. 30sec from Asakusa Stn Exit 4." },

  // Day 8: Mt Fuji
  { day: 8, match: "Mt Fuji", costAUD: 133, costJPY: 15200, notes: "Mini group tour with Kaba Bus amphibious vehicle experience. Bus ¥3,800/person one-way from Busta Shinjuku (2h35m). Or transport may be included in tour." },

  // Day 9: Kyoto
  { day: 9, match: "Shinkansen", costAUD: 249, costJPY: 28340, notes: "~¥14,170/person on Nozomi (~2h15m). Book via SmartEX app for best price." },

  // Day 10: Kyoto Day 2
  { day: 10, match: "Otagi", costAUD: 5, costJPY: 600, notes: "Temple with 1200 unique stone rakan statues. Entry ~¥300/person." },
  { day: 10, match: "Sagano Scenic", costAUD: 15, costJPY: 1760, notes: "Scenic train along Hozugawa River gorge through the Arashiyama mountains. ~¥880/person." },
  { day: 10, match: "Hozugawa", costAUD: 74, costJPY: 8400, notes: "Traditional wooden boat down the Hozu River rapids from Kameoka to Arashiyama. ~¥4,200/person, ~2hrs." },

  // Day 12: Ine
  { day: 12, match: "Ine Bay Boat", costAUD: 18, costJPY: 2000, notes: "See the funaya boat houses from the water. ~¥1,000/person for sightseeing boat." },

  // Day 13: Hiroshima
  { day: 13, match: "Hiroshima Peace", costAUD: 4, costJPY: 400, notes: "A-Bomb Dome, Peace Memorial Museum (¥200/person), cenotaph, flame of peace" },

  // Day 15: Kumamoto
  { day: 15, match: "Kumamoto Castle", costAUD: 14, costJPY: 1600, notes: "One of Japan's most impressive castles, partially restored after 2016 earthquake. ~¥800/person." },
  { day: 15, match: "Takachiho", costAUD: 45, costJPY: 5100, notes: "Stunning volcanic gorge with 17m waterfall. Boat ¥5,100/boat (Mon pricing — Jun 15 is Monday). Max 3 passengers. Book online 2 weeks ahead at 9AM JST. ¥1,000 penalty per 10min late!" },

  // Day 16: Travel
  { day: 16, match: "Travel back to Tokyo", costAUD: 474, costJPY: 54000, notes: "Shinkansen ~¥27,000/person. Kumamoto→Hakata (Kyushu Shinkansen ~35min) + Hakata→Tokyo (Nozomi ~5hrs). Book via SmartEX." },

  // Day 17: Harry Potter
  { day: 17, match: "Harry Potter", costAUD: 123, costJPY: 14000, notes: "¥7,000/person (June 2026 pricing — price increases Jul 1). Book well in advance, sells out quickly!" },
];

async function run() {
  console.log("Fetching all days...");
  const days = await client.query("days:list", {});
  console.log(`Found ${days.length} days`);

  let updated = 0;
  let notFound = 0;

  for (const update of costUpdates) {
    const day = days.find(d => d.dayNumber === update.day);
    if (!day) {
      console.log(`  Day ${update.day} not found!`);
      notFound++;
      continue;
    }

    const activities = await client.query("activities:listByDay", { dayId: day._id });
    const activity = activities.find(a => a.name.includes(update.match));

    if (!activity) {
      console.log(`  Day ${update.day}: No activity matching "${update.match}" (have: ${activities.map(a => a.name).join(", ")})`);
      notFound++;
      continue;
    }

    const patchArgs = {
      id: activity._id,
      estimatedCostAUD: update.costAUD,
      estimatedCostJPY: update.costJPY,
    };
    // Also update notes if provided
    if (update.notes) {
      patchArgs.notes = update.notes;
    }

    await client.mutation("activities:update", patchArgs);
    console.log(`  ✓ Day ${update.day}: "${activity.name}" → A$${update.costAUD} / ¥${update.costJPY}`);
    updated++;
  }

  console.log(`\nDone! Updated ${updated} activities, ${notFound} not found.`);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
