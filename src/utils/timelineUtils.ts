import {
  PrayerTimings,
  UserSettings,
  TimelineItem,
  PrayerName,
  DailyPrayerCheck,
} from "../types";

export const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const formatTo12Hour = (timeStr: string): string => {
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr ? mStr.substring(0, 2) : "00";
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
};

const HOME_GYM_PLAN = [
  {
    dayLabel: "Sunday",
    focus: "Full Body Burn",
    sets: 4,
    reps: "12-15 reps",
    description:
      "Bodyweight strength circuit with push-ups, squats, lunges, and planks.",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-active-girl-doing-stretching-44872-large.mp4",
  },
  {
    dayLabel: "Monday",
    focus: "Chest & Triceps",
    sets: 4,
    reps: "10-12 reps",
    description:
      "Push-up variations, chair dips, and overhead presses for upper body strength.",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-young-athlete-doing-workout-44718-large.mp4",
  },
  {
    dayLabel: "Tuesday",
    focus: "Back & Biceps",
    sets: 4,
    reps: "10-12 reps",
    description:
      "Pull motions, bodyweight rows, and resistance curls to build pulling power.",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-fit-man-doing-workout-at-the-gym-44713-large.mp4",
  },
  {
    dayLabel: "Wednesday",
    focus: "Legs & Core",
    sets: 4,
    reps: "12 reps",
    description:
      "Squats, lunges, calf raises, and plank holds to strengthen legs and core.",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-man-doing-leg-workout-in-gym-44717-large.mp4",
  },
  {
    dayLabel: "Thursday",
    focus: "HIIT Cardio",
    sets: 5,
    reps: "30s rounds",
    description:
      "High intensity interval training with jumping jacks, mountain climbers, and burpees.",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-athlete-in-gym-working-out-44711-large.mp4",
  },
  {
    dayLabel: "Friday",
    focus: "Shoulders & Abs",
    sets: 4,
    reps: "10-12 reps",
    description:
      "Shoulder presses, lateral raises, and core crunch circuits for upper body balance.",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-person-doing-shoulder-presses-44719-large.mp4",
  },
  {
    dayLabel: "Saturday",
    focus: "Recovery & Stretch",
    sets: 3,
    reps: "60s hold",
    description:
      "Mobility flows, hip openers, and deep stretches for recovery and flexibility.",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-athlete-doing-mobility-drills-44716-large.mp4",
  },
];

const getTodayGymWorkout = () => {
  const today = new Date().getDay();
  return HOME_GYM_PLAN[today];
};

export const generateDailyTimeline = (
  prayerTimings: PrayerTimings,
  settings: UserSettings,
  currentLessonTitle?: string,
  todayPrayerChecks?: DailyPrayerCheck,
): TimelineItem[] => {
  const items: TimelineItem[] = [];

  // 1. Prayer Times
  const prayerIcons: Record<PrayerName, { icon: string; color: string }> = {
    Fajr: { icon: "moon", color: "#818CF8" },
    Sunrise: { icon: "sun", color: "#FBBF24" },
    Dhuhr: { icon: "sun", color: "#F59E0B" },
    Asr: { icon: "sun", color: "#FB923C" },
    Maghrib: { icon: "sunset", color: "#EC4899" },
    Isha: { icon: "moon", color: "#6366F1" },
  };

  const prayers: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  prayers.forEach((name) => {
    const time = prayerTimings[name];
    if (time) {
      const prayerMins = timeToMinutes(time);
      const officeStartMins = timeToMinutes(settings.officeStart);
      const officeEndMins = timeToMinutes(settings.officeEnd);

      let badgeText: string | undefined;
      if (prayerMins >= officeStartMins && prayerMins <= officeEndMins) {
        badgeText = "🕌 Office Prayer";
      }

      const isChecked = todayPrayerChecks ? todayPrayerChecks[name] : false;

      items.push({
        id: `prayer-${name}`,
        title: `${name} Prayer`,
        subTitle: `Obligatory Salah • ${formatTo12Hour(time)}`,
        startTime: time,
        type: "prayer",
        iconName: prayerIcons[name]?.icon || "moon",
        color: prayerIcons[name]?.color || "#F59E0B",
        badgeText,
        isPrayer: true,
        prayerName: name,
        isPrayerChecked: isChecked,
      });
    }
  });

  // 2. Morning Gym Workout Block
  const gymStartMins = timeToMinutes(settings.gymStart || "06:15");
  const gymEndMins = gymStartMins + 75;
  const todayWorkout = getTodayGymWorkout();
  items.push({
    id: "morning-gym",
    title: `${todayWorkout.dayLabel} Home Workout`,
    subTitle: `${todayWorkout.focus} • ${todayWorkout.sets} sets • ${todayWorkout.reps}`,
    startTime: minutesToTime(gymStartMins),
    endTime: minutesToTime(gymEndMins),
    type: "gym_workout",
    iconName: "barbell",
    color: "#EF4444",
    badgeText: `🏋️ ${todayWorkout.dayLabel}`,
    isFocusable: true,
    allocatedMinutes: 75,
    videoUrl: todayWorkout.videoUrl,
    exerciseName: todayWorkout.focus,
    exerciseSets: todayWorkout.sets,
    exerciseReps: todayWorkout.reps,
    exerciseDescription: todayWorkout.description,
    exerciseDay: todayWorkout.dayLabel,
  });

  // 3. Commute & 8-Hour Office Schedule Breakdown
  const officeStartMins = timeToMinutes(settings.officeStart);
  const commuteMins = settings.commuteMinutes || 50;

  const morningCommuteStartMins = Math.max(0, officeStartMins - commuteMins);
  const eveningCommuteEndMins = Math.min(
    24 * 60 - 1,
    officeStartMins + 480 + commuteMins,
  );

  // Morning Commute (50 min)
  items.push({
    id: "commute-morning",
    title: "Commute to Office",
    subTitle: `${commuteMins} min travel • Departure @ ${formatTo12Hour(minutesToTime(morningCommuteStartMins))}`,
    startTime: minutesToTime(morningCommuteStartMins),
    endTime: settings.officeStart,
    type: "commute_to_office",
    iconName: "car",
    color: "#8B5CF6",
    badgeText: "🚗 Travel",
  });

  // Office 8 Hours Detailed Breakdown:
  // Slot 1: Office Core Work (2 Hours: 09:00 - 11:00 AM)
  const slot1Start = officeStartMins;
  const slot1End = officeStartMins + 120;
  items.push({
    id: "office-core-work",
    title: "Office Core Work",
    subTitle: `Priority deliverables & tickets • 2 Hours`,
    startTime: minutesToTime(slot1Start),
    endTime: minutesToTime(slot1End),
    type: "office_core",
    iconName: "briefcase",
    color: "#3B82F6",
    badgeText: "🏢 Office (2h)",
    isFocusable: true,
    allocatedMinutes: 120,
  });

  // Slot 2: Ship-a-thon Hackathon Work (2 Hours: 11:00 AM - 01:00 PM)
  const slot2Start = slot1End;
  const slot2End = slot2Start + 120;
  items.push({
    id: "shipathon-work",
    title: "Ship-a-thon Hackathon Project",
    subTitle: `Build & ship hackathon feature • 2 Hours`,
    startTime: minutesToTime(slot2Start),
    endTime: minutesToTime(slot2End),
    type: "shipathon_block",
    iconName: "rocket",
    color: "#14B8A6",
    badgeText: "🚀 Hackathon (2h)",
    isFocusable: true,
    allocatedMinutes: 120,
  });

  // Slot 3: Lunch, Rest & Dhuhr Break (1.5 Hours / 90 Mins: 01:00 PM - 02:30 PM)
  const slot3Start = slot2End;
  const slot3End = slot3Start + 90;
  items.push({
    id: "lunch-rest-break",
    title: "Lunch, Rest & Dhuhr Break",
    subTitle: `Meal, recharge & prayer break • 1 hr 30 min`,
    startTime: minutesToTime(slot3Start),
    endTime: minutesToTime(slot3End),
    type: "lunch_break",
    iconName: "restaurant",
    color: "#F59E0B",
    badgeText: "🍽 Lunch & Rest (1.5h)",
  });

  // Slot 4: AI Engineering Study (1 Hour: 02:30 PM - 03:30 PM)
  const slot4Start = slot3End;
  const slot4End = slot4Start + 60;
  items.push({
    id: "office-learning-slot",
    title: "AI from Scratch Study Slot",
    subTitle: currentLessonTitle || "AI Engineering from scratch • 1 Hour",
    startTime: minutesToTime(slot4Start),
    endTime: minutesToTime(slot4End),
    type: "learning_block",
    iconName: "book-open",
    color: "#EC4899",
    badgeText: "📚 AI from Scratch (1h)",
    isFocusable: true,
    allocatedMinutes: 60,
  });

  // Slot 4b: FDE Roadmap Study (1 Hour: 03:30 PM - 04:30 PM)
  const slot4bStart = slot4End;
  const slot4bEnd = slot4bStart + 60;
  items.push({
    id: "fde-learning-slot",
    title: "FDE Roadmap Study Slot",
    subTitle: "Founding Engineer roadmap (AI + CV) • 1 Hour",
    startTime: minutesToTime(slot4bStart),
    endTime: minutesToTime(slot4bEnd),
    type: "learning_block",
    iconName: "rocket-outline",
    color: "#38BDF8",
    badgeText: "🚀 FDE Roadmap (1h)",
    isFocusable: true,
    allocatedMinutes: 60,
  });

  // Slot 5: Wrap-up & Buffer (30 Mins: 04:30 PM - 05:00 PM)
  const slot5Start = slot4End;
  const slot5End = slot5Start + 30;
  items.push({
    id: "wrapup-buffer",
    title: "Wrap-up & Evening Buffer",
    subTitle: `Day log review & Asr prayer • 30 Mins`,
    startTime: minutesToTime(slot5Start),
    endTime: minutesToTime(slot5End),
    type: "wrapup_buffer",
    iconName: "checkmark-done",
    color: "#6366F1",
    badgeText: "☕ Wrap-up (30m)",
  });

  // Evening Commute (50 min: 05:00 PM - 05:50 PM)
  items.push({
    id: "commute-evening",
    title: "Commute Back Home",
    subTitle: `${commuteMins} min travel • Arrival @ ${formatTo12Hour(minutesToTime(eveningCommuteEndMins))}`,
    startTime: minutesToTime(slot5End),
    endTime: minutesToTime(eveningCommuteEndMins),
    type: "commute_to_home",
    iconName: "home",
    color: "#8B5CF6",
    badgeText: "🚗 Travel",
  });

  // 4. Night Sleep Force Routine Block (e.g., 10:30 PM to 04:30 AM / Fajr)
  const sleepStartMins = timeToMinutes(settings.sleepStart || "22:30");
  const fajrMins = prayerTimings.Fajr ? timeToMinutes(prayerTimings.Fajr) : 285; // ~04:45 AM
  items.push({
    id: "sleep-force-block",
    title: "Sleep Force & Wind Down",
    subTitle: "Put down phone • Mandatory rest for recovery",
    startTime: minutesToTime(sleepStartMins),
    endTime: minutesToTime(fajrMins),
    type: "sleep_force",
    iconName: "bed",
    color: "#38BDF8",
    badgeText: "🌙 SLEEP FORCE",
  });

  // Sort chronologically
  items.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  // Active status logic
  const now = new Date();
  const currentNowMins = now.getHours() * 60 + now.getMinutes();
  let activeFound = false;

  for (let i = 0; i < items.length; i++) {
    const itemMins = timeToMinutes(items[i].startTime);
    const nextItemMins =
      i < items.length - 1 ? timeToMinutes(items[i + 1].startTime) : 24 * 60;

    if (currentNowMins < itemMins) {
      items[i].isPast = false;
    } else if (
      currentNowMins >= itemMins &&
      currentNowMins < nextItemMins &&
      !activeFound
    ) {
      items[i].isCurrentActive = true;
      items[i].isPast = false;
      activeFound = true;
    } else {
      items[i].isPast = true;
    }
  }

  // Handle midnight wrap-around for Sleep Force (if current time is past sleepStart 22:30 or before Fajr)
  if (currentNowMins >= sleepStartMins || currentNowMins < fajrMins) {
    const sleepItem = items.find((it) => it.type === "sleep_force");
    if (sleepItem) {
      items.forEach((it) => {
        if (it.type !== "sleep_force") it.isCurrentActive = false;
      });
      sleepItem.isCurrentActive = true;
      sleepItem.isPast = false;
    }
  }

  return items;
};
