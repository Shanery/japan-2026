import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const seedTrip = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing data
    const existingDays = await ctx.db.query("days").collect();
    for (const day of existingDays) {
      await ctx.db.delete(day._id);
    }
    const existingActivities = await ctx.db.query("activities").collect();
    for (const activity of existingActivities) {
      await ctx.db.delete(activity._id);
    }
    const existingBudget = await ctx.db.query("budgetItems").collect();
    for (const item of existingBudget) {
      await ctx.db.delete(item._id);
    }
    const existingTravelInfo = await ctx.db.query("travelInfo").collect();
    for (const info of existingTravelInfo) {
      await ctx.db.delete(info._id);
    }
    const existingMemories = await ctx.db.query("memories").collect();
    for (const mem of existingMemories) {
      await ctx.db.delete(mem._id);
    }
    const existingSettings = await ctx.db.query("settings").collect();
    for (const s of existingSettings) {
      await ctx.db.delete(s._id);
    }

    // ─── CREATE ALL 17 DAYS ─────────────────────────────────────
    const daysData = [
      { dayNumber: 1, date: "2026-06-01", city: "Tokyo", summary: "Arrival at Narita ~4:20PM, check into hotel, first dinner in Japan", region: "Tokyo" },
      { dayNumber: 2, date: "2026-06-02", city: "Tokyo", summary: "Asagaya Shinmeigu, Castle & Parks, Loom lunch, PicoLabo", region: "Tokyo" },
      { dayNumber: 3, date: "2026-06-03", city: "Izu", summary: "Saphir Odoriko scenic train, Mt Omuro, Cape Irozaki, Kawazu", region: "Tokyo" },
      { dayNumber: 4, date: "2026-06-04", city: "Tokyo", summary: "Disney Sea — full day at the park", region: "Tokyo" },
      { dayNumber: 5, date: "2026-06-05", city: "Hakone", summary: "Lake Ashinoko cruise, Hakone Shrine, Owakudani, Tozan Railway", region: "Tokyo" },
      { dayNumber: 6, date: "2026-06-06", city: "Tokyo", summary: "Shopping day — Itoya, Pokemon Center, Capybara & Samoyed cafes, Glass Cutting", region: "Tokyo" },
      { dayNumber: 7, date: "2026-06-07", city: "Mitake", summary: "Mitake Village day trip — nature, hiking, traditional village", region: "Tokyo" },
      { dayNumber: 8, date: "2026-06-08", city: "Mt Fuji", summary: "Mt Fuji double lake tour with Kaba Bus experience", region: "Tokyo" },
      { dayNumber: 9, date: "2026-06-09", city: "Kyoto", summary: "Kyoto Day 1 — Kibune, Gion district shopping", region: "Kyoto" },
      { dayNumber: 10, date: "2026-06-10", city: "Kyoto", summary: "Kyoto Day 2 — Hiroji, Otagi, scenic train, river boat, Wazuka tea", region: "Kyoto" },
      { dayNumber: 11, date: "2026-06-11", city: "Shirakawago", summary: "Shirakawago — UNESCO thatched-roof village", region: "Kyoto" },
      { dayNumber: 12, date: "2026-06-12", city: "Ine / Tottori / Matsue", summary: "Ine fishing village, Tottori, drive to Matsue", region: "Kyoto" },
      { dayNumber: 13, date: "2026-06-13", city: "Hiroshima → Fukuoka", summary: "Hiroshima visit, then travel to Fukuoka", region: "Kyushu" },
      { dayNumber: 14, date: "2026-06-14", city: "Fukuoka", summary: "Fukuoka — scenic trains (Kanpachi Ichiroku, Aru Ressha dining train)", region: "Kyushu" },
      { dayNumber: 15, date: "2026-06-15", city: "Kumamoto", summary: "Kumamoto, Takachiho Gorge", region: "Kyushu" },
      { dayNumber: 16, date: "2026-06-16", city: "Travel", summary: "Travel day — 6.5hr journey back to Tokyo", region: "Tokyo" },
      { dayNumber: 17, date: "2026-06-17", city: "Tokyo", summary: "Harry Potter World, depart from Haneda 7:40PM", region: "Tokyo" },
    ];

    const dayIds: Record<number, Id<"days">> = {};
    for (const dayData of daysData) {
      const id = await ctx.db.insert("days", dayData);
      dayIds[dayData.dayNumber] = id;
    }

    // Helper to insert activities for a day. Costs live on budgetItems (linked
    // via activityId), not on activities themselves.
    const addActivities = async (
      dayNumber: number,
      activities: Array<{
        name: string;
        type: "food" | "activity" | "logistics" | "ticket";
        time?: string;
        location?: string;
        googleMapsUrl?: string;
        externalUrl?: string;
        notes?: string;
        isBooked?: boolean;
      }>
    ) => {
      for (let i = 0; i < activities.length; i++) {
        const a = activities[i];
        await ctx.db.insert("activities", {
          dayId: dayIds[dayNumber],
          name: a.name,
          type: a.type,
          time: a.time,
          location: a.location,
          googleMapsUrl: a.googleMapsUrl,
          externalUrl: a.externalUrl,
          notes: a.notes,
          isBooked: a.isBooked ?? false,
          order: i,
        });
      }
    };

    // ─── DAY 1: ARRIVAL IN TOKYO ────────────────────────────────
    await addActivities(1, [
      { name: "Flight JL774 — MEL → NRT", type: "logistics", time: "7:25 AM departure", notes: "Japan Airlines, 9h55m nonstop. Booking: AKBRJA / E6P96S", isBooked: true },
      { name: "Arrive at Tokyo Narita Airport", type: "logistics", time: "4:20 PM" },
      { name: "Travel to hotel", type: "logistics", time: "~5:00 PM", notes: "Narita Express or Limousine Bus to central Tokyo" },
      { name: "Check in to hotel", type: "logistics", time: "~6:00 PM" },
      { name: "Dinner — first meal in Japan!", type: "food", time: "~7:00 PM", notes: "Find a local spot near the hotel" },
    ]);

    // ─── DAY 2: TOKYO — ASAGAYA & ASAKUSA ──────────────────────
    await addActivities(2, [
      { name: "Breakfast", type: "food", time: "Morning", notes: "Shinpachi Shokudo Shinjuku Ten recommended", externalUrl: "https://tabelog.com/en/tokyo/A1304/A130401/13147298/" },
      { name: "Asagaya Shinmeigu Shrine", type: "activity", time: "Morning", location: "Asagaya, Suginami" },
      { name: "Castle & Parks", type: "activity", time: "Late morning" },
      { name: "Lunch at Loom (1.5 hrs)", type: "food", time: "~12:00 PM", location: "Orinami — Asakusa Store (formerly Hagumamu)", googleMapsUrl: "https://www.google.com/maps/place/Orinami+-+Asakusa+Store+(Formerly+Hagumamu)/@35.7148538,139.7964166,17z" },
      { name: "PicoLabo", type: "activity", time: "Afternoon", location: "Ueno, Taito", externalUrl: "https://www.tripadvisor.com.au/Attraction_Review-g14134274-d27702277-Reviews-PICOLABO_Wanooto-Ueno_Taito_Tokyo_Tokyo_Prefecture_Kanto.html" },
      { name: "Dinner", type: "food", time: "Evening" },
    ]);

    // ─── DAY 3: IZU PENINSULA ───────────────────────────────────
    await addActivities(3, [
      { name: "Breakfast", type: "food", time: "Morning" },
      { name: "Saphir Odoriko scenic train to Izu", type: "activity", time: "Morning", notes: "Green Class ¥10,060/person. Premium sightseeing train from Tokyo to Izu Peninsula, ~2.5hrs", externalUrl: "https://www.klook.com/en-AU/japan-rail/saphir-odoriko/", isBooked: false },
      { name: "Mount Omuro", type: "activity", time: "Late morning", notes: "Volcanic mountain with panoramic views. Chairlift ¥1,000/person roundtrip (walking up prohibited). 6-min ride to crater rim with 360° views.", externalUrl: "https://www.japan-guide.com/e/e6315.html" },
      { name: "Lunch in Izu", type: "food", time: "~12:30 PM", notes: "Fresh seafood recommended" },
      { name: "Cape Irozaki", type: "activity", time: "Afternoon", notes: "Southernmost point of Izu, stunning coastal views", externalUrl: "https://www.japan-guide.com/e/e6303.html" },
      { name: "Kawazu", type: "activity", time: "Late afternoon", notes: "Known for cherry blossoms and Kawazu Seven Waterfalls", externalUrl: "https://www.japan-guide.com/e/e6313.html" },
      { name: "Dinner in Izu", type: "food", time: "Evening" },
    ]);

    // ─── DAY 4: DISNEY SEA ──────────────────────────────────────
    await addActivities(4, [
      { name: "Breakfast — grab and go", type: "food", time: "Early morning", notes: "Eat early to maximize park time" },
      { name: "Travel to Tokyo DisneySea", type: "logistics", time: "~8:00 AM", notes: "JR to Maihama station, then Disney Resort Line" },
      { name: "Tokyo DisneySea — Full Day", type: "activity", time: "9:00 AM - 9:00 PM", location: "Maihama, Urayasu, Chiba", notes: "~¥10,900/person (peak pricing for Jun 4 weekday). Dynamic pricing: ¥7,900-¥10,900. Key areas: Mediterranean Harbor, Mysterious Island, Mermaid Lagoon, Arabian Coast" },
      { name: "Lunch inside DisneySea", type: "food", time: "~12:00 PM" },
      { name: "Dinner inside DisneySea", type: "food", time: "~6:00 PM" },
    ]);

    // ─── DAY 5: HAKONE ──────────────────────────────────────────
    await addActivities(5, [
      { name: "Breakfast", type: "food", time: "Morning" },
      { name: "Travel to Hakone (Hakone Free Pass)", type: "logistics", time: "Morning", notes: "¥7,100/person from Shinjuku. Includes: Odakyu train roundtrip, Tozan Railway, cable car, ropeway, Lake Ashinoko pirate ship, local buses. Covers all Day 5 transport." },
      { name: "Tozan Railway", type: "activity", time: "Mid-morning", notes: "Mountain railway through switchbacks (included in Hakone Free Pass)", externalUrl: "https://www.japan-guide.com/e/e5202.html" },
      { name: "Owakudani", type: "activity", time: "Late morning", notes: "Volcanic valley with hot springs, try the black eggs! (said to add 7 years to your life)", externalUrl: "https://www.japan-guide.com/e/e5203.html" },
      { name: "Lunch at Amasake Tea House", type: "food", time: "~12:30 PM", notes: "Historic tea house along the Old Tokaido Road, 400+ years old", externalUrl: "https://hakone-japan.com/things-to-do/foods-shops/cafe/amasake-chaya/" },
      { name: "Lake Ashinoko", type: "activity", time: "Afternoon", notes: "Scenic lake with views of Mt Fuji on clear days", externalUrl: "https://www.japan-guide.com/e/e5201.html" },
      { name: "Hakone Pirate Ship Cruise", type: "activity", time: "Afternoon", notes: "Cruise across Lake Ashinoko (included in Hakone Free Pass)", externalUrl: "https://www.hakonenavi.jp/international/en/transportation/hakone-kankosen" },
      { name: "Hakone Shrine", type: "activity", time: "Late afternoon", notes: "Iconic torii gate on the lake shore", externalUrl: "https://www.japan-guide.com/e/e5204.html" },
      { name: "Dinner", type: "food", time: "Evening" },
    ]);

    // ─── DAY 6: TOKYO SHOPPING DAY ──────────────────────────────
    await addActivities(6, [
      { name: "Breakfast", type: "food", time: "Morning" },
      { name: "Itoya Stationery Store", type: "activity", time: "Morning", location: "Ginza", notes: "Iconic 12-floor stationery paradise" },
      { name: "Pokemon Center", type: "activity", time: "Late morning", notes: "Official Pokemon merchandise store" },
      { name: "Lunch", type: "food", time: "~12:30 PM" },
      { name: "Capybara Cafe", type: "activity", time: "Afternoon", notes: "CapyNeko Kichijoji ¥2,800/person (50min) or Cafe Capyba Sumida ¥1,450/person (30min). Reservation required — opens 2 weeks before." },
      { name: "Samoyed Cafe Moffu", type: "activity", time: "Afternoon", notes: "~¥4,000/person for 1hr at Moffu Harajuku. Includes drinks. Extra dog treats ¥500. Reservation recommended." },
      { name: "Sokichi Glass Cutting Workshop", type: "activity", time: "Late afternoon", notes: "Edo Kiriko workshop ¥3,630/person + ~¥500 glass selection. 90min in Asakusa. 30sec from Asakusa Stn Exit 4.", externalUrl: "https://en.sokichi-workshop.com/" },
      { name: "Dinner", type: "food", time: "Evening" },
    ]);

    // ─── DAY 7: MITAKE VILLAGE ──────────────────────────────────
    await addActivities(7, [
      { name: "Breakfast", type: "food", time: "Morning" },
      { name: "Travel to Mitake", type: "logistics", time: "Morning", notes: "JR Chuo Line to Mitake station, then bus + cable car" },
      { name: "Mitake Village & Mt Mitake", type: "activity", time: "All day", notes: "Traditional mountain village with shrines, hiking trails, and nature. Musashi-Mitake Shrine at the summit.", externalUrl: "https://tokyocheapo.com/entertainment/outdoors/mount-mitake/" },
      { name: "Lunch in Mitake", type: "food", time: "~12:00 PM", notes: "Try local soba noodles" },
      { name: "Dinner", type: "food", time: "Evening" },
    ]);

    // ─── DAY 8: MT FUJI ────────────────────────────────────────
    await addActivities(8, [
      { name: "Breakfast — early", type: "food", time: "Early morning" },
      { name: "Mt Fuji Double Lake Day Tour", type: "activity", time: "All day", notes: "Mini group tour with Kaba Bus amphibious vehicle experience. Bus ¥3,800/person one-way from Busta Shinjuku (2h35m). Or transport may be included in tour.", externalUrl: "https://www.klook.com/en-AU/activity/177120-mini-group-tour-mount-fuji-double-lake-day-tour-kaba-bus-experience/" },
      { name: "Lunch included/near Fuji", type: "food", time: "~12:00 PM" },
      { name: "Dinner back in Tokyo", type: "food", time: "Evening" },
    ]);

    // ─── DAY 9: KYOTO DAY 1 ────────────────────────────────────
    await addActivities(9, [
      { name: "Breakfast", type: "food", time: "Early morning" },
      { name: "Shinkansen Tokyo → Kyoto", type: "logistics", time: "Morning", notes: "~¥14,170/person on Nozomi (~2h15m). Book via SmartEX app for best price." },
      { name: "Check in to Kyoto hotel", type: "logistics", time: "Late morning" },
      { name: "Kibune", type: "activity", time: "Afternoon", notes: "Mountain village north of Kyoto, famous for kawadoko (dining platforms over the river). Shrine entry free." },
      { name: "Lunch at Kibune — Kawadoko dining", type: "food", time: "~1:00 PM", notes: "Eat on platforms above the river — a unique Kyoto summer experience" },
      { name: "Gion District", type: "activity", time: "Late afternoon/evening", notes: "Historic geisha district, traditional wooden machiya houses, Hanamikoji street" },
      { name: "Shopping in Gion", type: "activity", time: "Evening", notes: "Traditional crafts, ceramics, tea shops" },
      { name: "Dinner in Gion", type: "food", time: "Evening" },
    ]);

    // ─── DAY 10: KYOTO DAY 2 ───────────────────────────────────
    await addActivities(10, [
      { name: "Breakfast", type: "food", time: "Morning" },
      { name: "Otagi Nenbutsu-ji Temple", type: "activity", time: "Morning", notes: "Temple with 1200 unique stone rakan statues, each with a different expression. Entry ~¥300." },
      { name: "Sagano Scenic Railway", type: "activity", time: "Late morning", notes: "Scenic train along Hozugawa River gorge through the Arashiyama mountains. ~¥880/person." },
      { name: "Hozugawa River Boat Ride", type: "activity", time: "Midday", notes: "Traditional wooden boat down the Hozu River rapids from Kameoka to Arashiyama. ~¥4,200/person, ~2hrs." },
      { name: "Lunch", type: "food", time: "~1:00 PM" },
      { name: "Wazuka Tea Plantation", type: "activity", time: "Afternoon", notes: "Visit tea fields in Wazuka, the heart of Uji tea country. Tea picking or tasting experience." },
      { name: "Dinner", type: "food", time: "Evening" },
    ]);

    // ─── DAY 11: SHIRAKAWAGO ────────────────────────────────────
    await addActivities(11, [
      { name: "Breakfast", type: "food", time: "Early morning" },
      { name: "Travel to Shirakawago", type: "logistics", time: "Morning", notes: "Bus from Takayama (~50 min) or Kyoto. Consider stopping in Takayama." },
      { name: "Takayama Old Town", type: "activity", time: "Morning", notes: "Well-preserved Edo-period streets, morning markets, sake breweries" },
      { name: "Lunch in Takayama", type: "food", time: "~12:00 PM", notes: "Try Hida beef — the local specialty" },
      { name: "Shirakawago Village", type: "activity", time: "Afternoon", notes: "UNESCO World Heritage site with traditional gassho-zukuri thatched-roof farmhouses" },
      { name: "Shiroyama Viewpoint", type: "activity", time: "Afternoon", notes: "Panoramic viewpoint overlooking the village — the classic photo spot" },
      { name: "Dinner", type: "food", time: "Evening" },
    ]);

    // ─── DAY 12: INE / TOTTORI / MATSUE ────────────────────────
    await addActivities(12, [
      { name: "Breakfast", type: "food", time: "Early morning" },
      { name: "Ine Fishing Village", type: "activity", time: "Morning", notes: "Picturesque fishing village with 230+ funaya (boat houses) lining the bay. ~2.5hr travel.", location: "Ine, Kyoto Prefecture" },
      { name: "Ine Bay Boat Tour", type: "activity", time: "Morning", notes: "See the funaya boat houses from the water. ~¥1,000/person for sightseeing boat." },
      { name: "Lunch", type: "food", time: "~12:00 PM" },
      { name: "Drive to Tottori", type: "logistics", time: "Afternoon", notes: "~2.5 hours from Ine" },
      { name: "Tottori Sand Dunes", type: "activity", time: "Afternoon", notes: "Japan's largest sand dunes along the Sea of Japan coast" },
      { name: "Drive to Matsue", type: "logistics", time: "Late afternoon", notes: "~2.5 hours from Tottori" },
      { name: "Check in to Matsue accommodation", type: "logistics", time: "Evening" },
      { name: "Dinner in Matsue", type: "food", time: "Evening" },
    ]);

    // ─── DAY 13: HIROSHIMA → FUKUOKA ───────────────────────────
    await addActivities(13, [
      { name: "Breakfast", type: "food", time: "Early morning" },
      { name: "Travel to Hiroshima", type: "logistics", time: "Morning", notes: "~2.5 hours from Matsue by car/train" },
      { name: "Hiroshima Peace Memorial Park", type: "activity", time: "Late morning", notes: "A-Bomb Dome, Peace Memorial Museum (¥200/person), cenotaph, flame of peace" },
      { name: "Lunch — Hiroshima Okonomiyaki", type: "food", time: "~12:30 PM", notes: "Must try Hiroshima-style layered okonomiyaki" },
      { name: "Travel to Fukuoka", type: "logistics", time: "Afternoon", notes: "Shinkansen from Hiroshima to Hakata (~1hr) or drive ~3.5hrs" },
      { name: "Check in to Fukuoka hotel", type: "logistics", time: "Late afternoon" },
      { name: "Dinner — Hakata Yatai (street food stalls)", type: "food", time: "Evening", notes: "Famous open-air food stalls along the Naka River serving Hakata ramen, yakitori, gyoza" },
    ]);

    // ─── DAY 14: FUKUOKA — SCENIC TRAINS ───────────────────────
    await addActivities(14, [
      { name: "Breakfast", type: "food", time: "Morning" },
      { name: "Kanpachi Ichiroku Limited Express", type: "activity", time: "Morning", notes: "Scenic sightseeing train through Kyushu", externalUrl: "https://www.klook.com/en-US/activity/125068-limited-express-kanpachi-ichiroku-train/" },
      { name: "Lunch on train or at stop", type: "food", time: "~12:00 PM" },
      { name: "JR Kyushu Aru Ressha Dining Train", type: "activity", time: "Afternoon", notes: "Luxury dining train experience through Kyushu countryside", externalUrl: "https://www.klook.com/en-US/activity/71160-jrkyushu-aruressha-dining-train/" },
      { name: "Explore Fukuoka", type: "activity", time: "Late afternoon", notes: "Canal City, Ohori Park, or Fukuoka Tower" },
      { name: "Dinner", type: "food", time: "Evening" },
    ]);

    // ─── DAY 15: KUMAMOTO / TAKACHIHO GORGE ────────────────────
    await addActivities(15, [
      { name: "Breakfast", type: "food", time: "Early morning" },
      { name: "Travel to Kumamoto", type: "logistics", time: "Morning", notes: "Shinkansen from Hakata (~35min)" },
      { name: "Kumamoto Castle", type: "activity", time: "Morning", notes: "One of Japan's most impressive castles, partially restored after 2016 earthquake. ~¥800/person." },
      { name: "Lunch in Kumamoto", type: "food", time: "~12:00 PM", notes: "Try basashi (horse meat sashimi) — local delicacy" },
      { name: "Takachiho Gorge", type: "activity", time: "Afternoon", notes: "Stunning volcanic gorge with 17m waterfall. Boat ¥5,100/boat (Mon pricing — Jun 15 is Monday). Max 3 passengers. Book online 2 weeks ahead at 9AM JST. ¥1,000 penalty per 10min late! ~1.5hr drive from Kumamoto.", location: "Takachiho, Miyazaki" },
      { name: "Dinner", type: "food", time: "Evening" },
    ]);

    // ─── DAY 16: TRAVEL DAY BACK TO TOKYO ──────────────────────
    await addActivities(16, [
      { name: "Breakfast", type: "food", time: "Morning" },
      { name: "Check out of accommodation", type: "logistics", time: "Morning" },
      { name: "Shinkansen Kumamoto → Tokyo", type: "logistics", time: "All day", notes: "~¥27,000/person. Kumamoto→Hakata (Kyushu Shinkansen ~35min) + Hakata→Tokyo (Nozomi ~5hrs). Book via SmartEX." },
      { name: "Lunch on the road / train", type: "food", time: "~12:00 PM", notes: "Ekiben (train bento) recommended!" },
      { name: "Check in to Tokyo hotel", type: "logistics", time: "Late afternoon" },
      { name: "Dinner — last evening to explore Tokyo", type: "food", time: "Evening" },
    ]);

    // ─── DAY 17: HARRY POTTER & DEPARTURE ──────────────────────
    await addActivities(17, [
      { name: "Breakfast", type: "food", time: "Early morning" },
      { name: "Warner Bros. Studio Tour — Harry Potter", type: "activity", time: "Morning - ~3:00 PM", notes: "¥7,000/person (June 2026 pricing — price increases Jul 1). Book well in advance, sells out quickly!", location: "Nerima, Tokyo" },
      { name: "Lunch at Harry Potter World or nearby", type: "food", time: "~12:00 PM" },
      { name: "Leave for Haneda Airport", type: "logistics", time: "~4:00 PM", notes: "Allow plenty of time for check-in and duty free" },
      { name: "Flight JL51 — HND → SYD", type: "logistics", time: "7:40 PM", notes: "Japan Airlines, 9h40m. Arrives SYD 6:20 AM +1 day. Then QF421 SYD→MEL 8:25AM-10:00AM.", isBooked: true },
    ]);

    // Build activity lookup by day + name fragment, for linking budgetItems → activities.
    const allActivities = await ctx.db.query("activities").collect();
    const findActivity = (dayNumber: number, nameFragment: string): Id<"activities"> => {
      const dayId = dayIds[dayNumber];
      const match = allActivities.find(
        (a) => a.dayId === dayId && a.name.includes(nameFragment)
      );
      if (!match) {
        throw new Error(`Activity not found: day ${dayNumber} "${nameFragment}"`);
      }
      return match._id;
    };

    // ─── BUDGET ITEMS ───────────────────────────────────────────
    await ctx.db.insert("budgetItems", {
      category: "Flights",
      description: "MEL → NRT → MEL — Japan Airlines/Qantas via Hopper (2 passengers)",
      amountAUD: 2356.42,
      isPaid: true,
      notes: "Booking ref: AKBRJA (Hopper) / E6P96S (JAL/QF)",
    });

    // ─── HOTELS (placeholder — not yet booked) ────────────────
    await ctx.db.insert("budgetItems", {
      category: "Hotels",
      description: "Hotels — 16 nights (to be researched & booked)",
      isPaid: false,
      notes: "Need to book: Tokyo (nights 1-8), Kyoto (nights 9-11), Matsue (night 12), Fukuoka (nights 13-14), Kumamoto (night 15), Tokyo (night 16)",
    });

    // ─── TRANSPORT (researched April 2026) ──────────────────
    // Tokyo phase: public transport only (Days 1-8)
    await ctx.db.insert("budgetItems", {
      category: "Transport",
      description: "Saphir Odoriko Green Class x2 (Day 3: Tokyo → Izu)",
      amountJPY: 20120,
      amountAUD: 176,
      isPaid: false,
      dayNumber: 3,
      activityId: findActivity(3, "Saphir Odoriko"),
      notes: "¥10,060/person Green Class. Luxury scenic train to Izu Peninsula, ~2.5hrs. Book via JR East or Klook.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Transport",
      description: "Hakone Free Pass 2-Day x2 (Day 5: from Shinjuku)",
      amountJPY: 14200,
      amountAUD: 125,
      isPaid: false,
      dayNumber: 5,
      activityId: findActivity(5, "Travel to Hakone"),
      notes: "¥7,100/person from Shinjuku. Includes: Odakyu train roundtrip, Hakone Tozan Railway, cable car, ropeway, Lake Ashinoko pirate ship cruise, local buses. Covers essentially all Day 5 transport.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Transport",
      description: "Mt Fuji bus/tour x2 (Day 8: Shinjuku → 5th Stn)",
      amountJPY: 15200,
      amountAUD: 133,
      isPaid: false,
      dayNumber: 8,
      activityId: findActivity(8, "Mt Fuji Double Lake"),
      notes: "¥3,800/person one-way from Busta Shinjuku (2h35m direct). If doing Kaba Bus tour, transport may be included.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Transport",
      description: "Tokyo local transit — IC card, metro (Days 1-8)",
      amountJPY: 16000,
      amountAUD: 140,
      isPaid: false,
      notes: "Estimated ~¥1,000/person/day for 8 days. Suica/Pasmo IC card top-ups for metro, local JR lines, buses.",
    });

    // Shinkansen legs (individual tickets — no JR Pass)
    await ctx.db.insert("budgetItems", {
      category: "Transport",
      description: "Shinkansen Tokyo → Kyoto x2 (Day 9: Nozomi)",
      amountJPY: 28340,
      amountAUD: 249,
      isPaid: false,
      dayNumber: 9,
      activityId: findActivity(9, "Shinkansen Tokyo"),
      notes: "~¥14,170/person on Nozomi (~2h15m). Book via SmartEX app for best price. Can also use Hikari (~2h40m) for slightly less.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Transport",
      description: "Shinkansen Kumamoto → Tokyo x2 (Day 16)",
      amountJPY: 54000,
      amountAUD: 474,
      isPaid: false,
      dayNumber: 16,
      activityId: findActivity(16, "Shinkansen Kumamoto"),
      notes: "~¥27,000/person. Kumamoto→Hakata (Kyushu Shinkansen ~35min) + Hakata→Tokyo (Nozomi ~5hrs). Book via SmartEX.",
    });

    // Car rental phase (Days 9-15: Kyoto → Kumamoto)
    await ctx.db.insert("budgetItems", {
      category: "Transport",
      description: "Car rental — 7 days, Kyoto pickup → Kumamoto dropoff",
      amountAUD: 400,
      isPaid: false,
      notes: "Estimated ~A$50-60/day for compact car. One-way drop-off fee Kyoto→Kumamoto will add extra. Check Toyota Rent-a-Car, ORIX, Times Car, Nippon Rent-A-Car. Need International Driving Permit.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Transport",
      description: "Fuel — car rental (~1,500km estimated)",
      amountJPY: 10000,
      amountAUD: 88,
      isPaid: false,
      notes: "Rough estimate for driving Kyoto→Shirakawago→Ine→Tottori→Matsue→Hiroshima→Fukuoka→Kumamoto. Japan fuel ~¥170/L, compact car ~15km/L.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Transport",
      description: "SEP expressway pass — 3 days (San'in-Setouchi region)",
      amountJPY: 10700,
      amountAUD: 94,
      isPaid: false,
      notes: "Unlimited expressway use in San'in/Setouchi region. Covers driving from Kyoto area through Tottori, Matsue, to Hiroshima. Foreign tourist discount pass via ETC card with rental car.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Transport",
      description: "KEP expressway pass — 3 days (Kyushu region)",
      amountJPY: 8400,
      amountAUD: 74,
      isPaid: false,
      notes: "Unlimited Kyushu expressways. Covers Fukuoka↔Kumamoto↔Takachiho area. Foreign tourist discount pass via ETC card with rental car.",
    });

    // Day 14 scenic trains (parking car in Fukuoka for the day)
    await ctx.db.insert("budgetItems", {
      category: "Transport",
      description: "Kanpachi Ichiroku scenic train x2 (Day 14)",
      isPaid: false,
      dayNumber: 14,
      notes: "Scenic sightseeing train through Kyushu. Cost TBD — check Klook or JR Kyushu for current pricing. Park car at Hakata station.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Transport",
      description: "Aru Ressha dining train x2 (Day 14)",
      isPaid: false,
      dayNumber: 14,
      notes: "JR Kyushu luxury dining train experience. Cost TBD — check jrkyushu-aruressha.jp. This is a premium experience with meal service included.",
    });

    // ─── ACTIVITIES & TICKETS (researched April 2026) ───────
    await ctx.db.insert("budgetItems", {
      category: "Activities",
      description: "Mt Omuro Chairlift x2 (Day 3)",
      amountJPY: 2000,
      amountAUD: 18,
      isPaid: false,
      dayNumber: 3,
      activityId: findActivity(3, "Mount Omuro"),
      notes: "¥1,000/person roundtrip. Walking up prohibited. 6-min ride to crater rim with 360° views.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Activities",
      description: "Tokyo DisneySea 1-Day Passport x2 (Day 4)",
      amountJPY: 21800,
      amountAUD: 191,
      isPaid: false,
      dayNumber: 4,
      activityId: findActivity(4, "Tokyo DisneySea"),
      notes: "~¥10,900/person (peak pricing estimate for Jun 4 weekday). Dynamic pricing: ¥7,900-¥10,900 depending on date.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Activities",
      description: "Capybara Cafe x2 (Day 6)",
      amountJPY: 5600,
      amountAUD: 49,
      isPaid: false,
      dayNumber: 6,
      activityId: findActivity(6, "Capybara"),
      notes: "Options: CapyNeko Kichijoji ¥2,800/person (50min) or Cafe Capyba Sumida ¥1,450/person (30min). Reservation required — opens 2 weeks before.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Activities",
      description: "Samoyed Cafe Moffu x2 (Day 6)",
      amountJPY: 8000,
      amountAUD: 70,
      isPaid: false,
      dayNumber: 6,
      activityId: findActivity(6, "Samoyed"),
      notes: "~¥4,000/person for 1hr at Moffu Harajuku. Includes drinks. Extra dog treats ¥500.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Activities",
      description: "Sokichi Edo Kiriko Glass Cutting x2 (Day 6)",
      amountJPY: 8260,
      amountAUD: 72,
      isPaid: false,
      dayNumber: 6,
      activityId: findActivity(6, "Sokichi Glass"),
      notes: "¥3,630/person + ~¥500 avg glass selection. 90min workshop in Asakusa.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Activities",
      description: "Otagi Nenbutsu-ji Temple x2 (Day 10)",
      amountJPY: 600,
      amountAUD: 5,
      isPaid: false,
      dayNumber: 10,
      activityId: findActivity(10, "Otagi"),
      notes: "¥300/person. Temple with 1200 unique stone rakan statues.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Activities",
      description: "Sagano Scenic Railway x2 (Day 10)",
      amountJPY: 1760,
      amountAUD: 15,
      isPaid: false,
      dayNumber: 10,
      activityId: findActivity(10, "Sagano"),
      notes: "~¥880/person. Scenic train along the Hozugawa River gorge through the Arashiyama mountains.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Activities",
      description: "Hozugawa River Boat Ride x2 (Day 10)",
      amountJPY: 8400,
      amountAUD: 74,
      isPaid: false,
      dayNumber: 10,
      activityId: findActivity(10, "Hozugawa"),
      notes: "~¥4,200/person. Traditional wooden boat down the Hozu River rapids from Kameoka to Arashiyama. ~2hrs.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Activities",
      description: "Ine Bay Boat Tour x2 (Day 12)",
      amountJPY: 2000,
      amountAUD: 18,
      isPaid: false,
      dayNumber: 12,
      activityId: findActivity(12, "Ine Bay"),
      notes: "~¥1,000/person for sightseeing boat. See the funaya boat houses from the water.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Activities",
      description: "Hiroshima Peace Memorial Museum x2 (Day 13)",
      amountJPY: 400,
      amountAUD: 4,
      isPaid: false,
      dayNumber: 13,
      activityId: findActivity(13, "Hiroshima Peace"),
      notes: "¥200/person. One of the most powerful museums in Japan.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Activities",
      description: "Kumamoto Castle entry x2 (Day 15)",
      amountJPY: 1600,
      amountAUD: 14,
      isPaid: false,
      dayNumber: 15,
      activityId: findActivity(15, "Kumamoto Castle"),
      notes: "~¥800/person. Partially restored after 2016 earthquake.",
    });

    await ctx.db.insert("budgetItems", {
      category: "Activities",
      description: "Takachiho Gorge boat rental (Day 15)",
      amountJPY: 5100,
      amountAUD: 45,
      isPaid: false,
      dayNumber: 15,
      activityId: findActivity(15, "Takachiho"),
      notes: "¥5,100/boat (Mon pricing — Jun 15 is a Monday). Max 3 passengers per boat. Book online 2 weeks ahead at 9AM JST. ¥1,000 penalty per 10min late!",
    });

    await ctx.db.insert("budgetItems", {
      category: "Activities",
      description: "Warner Bros. Studio Tour Harry Potter x2 (Day 17)",
      amountJPY: 14000,
      amountAUD: 123,
      isPaid: false,
      dayNumber: 17,
      activityId: findActivity(17, "Harry Potter"),
      notes: "¥7,000/person (June 2026 pricing — price increases Jul 1). Book well in advance, sells out quickly!",
    });

    await ctx.db.insert("budgetItems", {
      category: "Activities",
      description: "Other temple/shrine fees & small attractions (misc)",
      amountJPY: 6000,
      amountAUD: 53,
      isPaid: false,
      notes: "Buffer for various small entry fees across the trip (Tottori Sand Dunes museum, Matsue Castle, etc). Typically ¥300-800 each.",
    });

    // ─── TRAVEL INFO — FLIGHTS ──────────────────────────────────
    await ctx.db.insert("travelInfo", {
      type: "flight",
      title: "Outbound — MEL → NRT",
      details: JSON.stringify({
        airline: "Japan Airlines",
        flightNumber: "JL774",
        departure: { airport: "MEL", city: "Melbourne", date: "2026-06-01", time: "7:25 AM" },
        arrival: { airport: "NRT", city: "Tokyo Narita", date: "2026-06-01", time: "4:20 PM" },
        duration: "9h55m",
        seatClass: "Economy Standard",
        nonstop: true,
        passengers: ["Shane Ray Yu", "Yang Xia Chen"],
        totalCost: "A$2,356.42 (both passengers, all flights)",
      }),
      bookingReference: "AKBRJA",
      confirmationNumber: "E6P96S",
      dayNumber: 1,
      order: 0,
    });

    await ctx.db.insert("travelInfo", {
      type: "flight",
      title: "Return Leg 1 — HND → SYD",
      details: JSON.stringify({
        airline: "Japan Airlines",
        flightNumber: "JL51",
        departure: { airport: "HND", city: "Tokyo Haneda", date: "2026-06-17", time: "7:40 PM" },
        arrival: { airport: "SYD", city: "Sydney", date: "2026-06-18", time: "6:20 AM" },
        duration: "9h40m",
        seatClass: "Economy Standard",
        nonstop: true,
        layover: "2h05m in Sydney before connection",
      }),
      bookingReference: "AKBRJA",
      confirmationNumber: "E6P96S",
      dayNumber: 17,
      order: 1,
    });

    await ctx.db.insert("travelInfo", {
      type: "flight",
      title: "Return Leg 2 — SYD → MEL",
      details: JSON.stringify({
        airline: "Qantas",
        flightNumber: "QF421",
        departure: { airport: "SYD", city: "Sydney", date: "2026-06-18", time: "8:25 AM" },
        arrival: { airport: "MEL", city: "Melbourne", date: "2026-06-18", time: "10:00 AM" },
        duration: "1h35m",
        seatClass: "Economy Standard",
      }),
      bookingReference: "AKBRJA",
      confirmationNumber: "E6P96S",
      dayNumber: 17,
      order: 2,
    });

    // ─── TRAVEL INFO — SCENIC TRAINS ────────────────────────────
    await ctx.db.insert("travelInfo", {
      type: "train",
      title: "Saphir Odoriko — Tokyo to Izu",
      details: JSON.stringify({
        description: "Premium sightseeing train with ocean views",
        route: "Tokyo/Shinjuku → Izukyu-Shimoda",
        website: "https://www.klook.com/en-AU/japan-rail/saphir-odoriko/",
      }),
      dayNumber: 3,
      order: 0,
    });

    await ctx.db.insert("travelInfo", {
      type: "train",
      title: "Kanpachi Ichiroku Limited Express",
      details: JSON.stringify({
        description: "Scenic sightseeing train through Kyushu",
        website: "https://www.klook.com/en-US/activity/125068-limited-express-kanpachi-ichiroku-train/",
      }),
      dayNumber: 14,
      order: 0,
    });

    await ctx.db.insert("travelInfo", {
      type: "train",
      title: "Aru Ressha Dining Train",
      details: JSON.stringify({
        description: "JR Kyushu luxury dining train experience",
        website: "https://www.klook.com/en-US/activity/71160-jrkyushu-aruressha-dining-train/",
        officialSite: "https://www.jrkyushu-aruressha.jp/en/",
      }),
      dayNumber: 14,
      order: 1,
    });

    await ctx.db.insert("travelInfo", {
      type: "train",
      title: "Tobu SpaciaX",
      details: JSON.stringify({
        description: "Luxury express train",
        website: "https://www.tobu.co.jp/spaciax/en/",
      }),
      order: 2,
    });

    await ctx.db.insert("travelInfo", {
      type: "train",
      title: "JR Kyushu Scenic Trains",
      details: JSON.stringify({
        description: "Various scenic railway options across Kyushu",
        website: "https://www.jrkyushu.co.jp/english/train/kanroku.html",
        allTrains: "https://www.jrkyushu-aruressha.jp/en/",
      }),
      order: 3,
    });

    // ─── SETTINGS ───────────────────────────────────────────────
    await ctx.db.insert("settings", {
      key: "exchangeRate",
      value: "114",
    });

    return {
      success: true,
      message: "Trip data seeded successfully with full itinerary!",
      daysCreated: daysData.length,
    };
  },
});
