"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Course = {
  id: string;
  Course?: string;
  Days?: string;
  "End Time"?: string;
  "Enrl Cap"?: string | number;
  "Guest Lecture Fit"?: string;
  Instructor?: string;
  Mode?: string;
  Section?: string;
  "Start Time"?: string;
  Title?: string;
  lastUpdated?: Timestamp | Date | string | null;
};

type EventCalendar = {
  id: string;
  "Course Alignment"?: string;
  "IA Event Date"?: string;
  "Nearby Universities"?: string;
  Region?: string;
  "Suggested Lecture Window"?: string;
  lastUpdated?: Timestamp | Date | string | null;
};

type EventContact = {
  id: string;
  Category?: string;
  "Contact Email / Phone (published)"?: string;
  "Event / Program"?: string;
  "Host / Unit"?: string;
  "Point(s) of Contact (published)"?: string;
  "Primary Audience"?: string;
  "Public URL"?: string;
  "Recurrence (typical)"?: string;
  "Volunteer Roles (fit)"?: string;
  lastUpdated?: Timestamp | Date | string | null;
};

type UserRow = {
  id: string;
  createdAt?: Timestamp | Date | string | null;
  email?: string;
  lastLoginAt?: Timestamp | Date | string | null;
  metroRegion?: string;
  role?: string;
  username?: string;
};

type Volunteer = {
  id: string;
  "Board Role"?: string;
  Company?: string;
  "Expertise Tags"?: string;
  "Metro Region"?: string;
  Name?: string;
  name?: string;
  Title?: string;
  lastUpdated?: Timestamp | Date | string | null;
};

const CHART_COLORS = {
  blue: "#2563eb",
  indigo: "#4f46e5",
  violet: "#7c3aed",
  emerald: "#059669",
  amber: "#d97706",
  rose: "#e11d48",
  cyan: "#0891b2",
  slate: "#475569",
};

function pct(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(1));
}

function ratio(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Number((numerator / denominator).toFixed(1));
}

function monthKey(date?: Date | null) {
  if (!date) return "Unknown";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(key: string) {
  if (key === "Unknown") return key;
  const [year, month] = key.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

function parseFirestoreDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;

  if (typeof value === "object" && value !== null && "toDate" in value) {
    try {
      const maybeDate = (value as { toDate?: () => Date }).toDate?.();
      return maybeDate ?? null;
    } catch {
      return null;
    }
  }

  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

function parseEventDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeListValue(value?: string | null) {
  return value?.trim() || "Unknown";
}

function splitMultiValue(value?: string | null) {
  if (!value) return [];
  return value
    .split(/[;,|]/g)
    .map((v) => v.trim())
    .filter(Boolean);
}

function countBy<T>(
  rows: T[],
  getKey: (row: T) => string | undefined | null
): Array<{ name: string; value: number }> {
  const map = new Map<string, number>();

  rows.forEach((row) => {
    const key = normalizeListValue(getKey(row));
    map.set(key, (map.get(key) ?? 0) + 1);
  });

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function topN<T extends { value?: number }>(rows: T[], limit = 8) {
  return rows.slice(0, limit);
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function monthKeyFromParts(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

function lastNMonthKeys(count: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  return Array.from({ length: count }, (_, index) => {
    const d = addMonths(start, -(count - 1) + index);
    return monthKeyFromParts(d.getFullYear(), d.getMonth());
  });
}

function kpiCard(
  title: string,
  value: string | number,
  subtext: string,
  tone: "default" | "success" | "warning" = "default"
) {
  const toneMap = {
    default: "border-slate-200 bg-white",
    success: "border-emerald-200 bg-emerald-50",
    warning: "border-amber-200 bg-amber-50",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneMap[tone]}`}>
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="mt-2 text-sm text-slate-600">{subtext}</div>
    </div>
  );
}

export default function IAWestKPIDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [eventCalendar, setEventCalendar] = useState<EventCalendar[]>([]);
  const [eventContacts, setEventContacts] = useState<EventContact[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    unsubscribers.push(
      onSnapshot(collection(db, "courses"), (snapshot) => {
        setCourses(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Course[]
        );
      })
    );

    unsubscribers.push(
      onSnapshot(collection(db, "event_calendar"), (snapshot) => {
        setEventCalendar(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as EventCalendar[]
        );
      })
    );

    unsubscribers.push(
      onSnapshot(collection(db, "events_contacts"), (snapshot) => {
        setEventContacts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as EventContact[]
        );
      })
    );

    unsubscribers.push(
      onSnapshot(collection(db, "users"), (snapshot) => {
        setUsers(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as UserRow[]
        );
      })
    );

    unsubscribers.push(
      onSnapshot(collection(db, "volunteers"), (snapshot) => {
        setVolunteers(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Volunteer[]
        );
        setLoading(false);
      })
    );

    return () => unsubscribers.forEach((fn) => fn());
  }, []);

  const metrics = useMemo(() => {
    const totalCourses = courses.length;
    const totalCalendarEvents = eventCalendar.length;
    const totalContacts = eventContacts.length;
    const totalUsers = users.length;
    const totalVolunteers = volunteers.length;

    const coursesWithGuestLectureFit = courses.filter(
      (c) => !!c["Guest Lecture Fit"] && c["Guest Lecture Fit"] !== "Unknown"
    ).length;

    const usersWithRecentLogin = users.filter((u) =>
      parseFirestoreDate(u.lastLoginAt)
    ).length;

    const volunteerRegions = countBy(volunteers, (v) => v["Metro Region"]);
    const userRoles = countBy(users, (u) => u.role);
    const eventRegions = countBy(eventCalendar, (e) => e.Region);
    const contactCategories = countBy(eventContacts, (e) => e.Category);
    const courseModes = countBy(courses, (c) => c.Mode);
    const guestLectureFit = countBy(courses, (c) => c["Guest Lecture Fit"]);
    const courseDays = countBy(courses, (c) => c.Days);

    const monthlyMap = new Map<
      string,
      {
        month: string;
        courses: number;
        events: number;
        contacts: number;
        users: number;
        volunteers: number;
      }
    >();

    const ensureMonth = (key: string) => {
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          month: key,
          courses: 0,
          events: 0,
          contacts: 0,
          users: 0,
          volunteers: 0,
        });
      }
      return monthlyMap.get(key)!;
    };

    courses.forEach((row) => {
      const key = monthKey(parseFirestoreDate(row.lastUpdated));
      ensureMonth(key).courses += 1;
    });

    eventCalendar.forEach((row) => {
      const key = monthKey(parseFirestoreDate(row.lastUpdated));
      ensureMonth(key).events += 1;
    });

    eventContacts.forEach((row) => {
      const key = monthKey(parseFirestoreDate(row.lastUpdated));
      ensureMonth(key).contacts += 1;
    });

    users.forEach((row) => {
      const key = monthKey(
        parseFirestoreDate(row.createdAt) || parseFirestoreDate(row.lastLoginAt)
      );
      ensureMonth(key).users += 1;
    });

    volunteers.forEach((row) => {
      const key = monthKey(parseFirestoreDate(row.lastUpdated));
      ensureMonth(key).volunteers += 1;
    });

    const monthKeys = new Set<string>(lastNMonthKeys(6));
    Array.from(monthlyMap.keys()).forEach((key) => monthKeys.add(key));

    const monthlyTrend = Array.from(monthKeys)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => {
        const row = monthlyMap.get(key) ?? {
          month: key,
          courses: 0,
          events: 0,
          contacts: 0,
          users: 0,
          volunteers: 0,
        };

        return {
          ...row,
          monthLabel: formatMonthLabel(key),
        };
      });

    const upcomingEventsByMonthMap = new Map<string, number>();
    eventCalendar.forEach((row) => {
      const date = parseEventDate(row["IA Event Date"]);
      const key = monthKey(date);
      upcomingEventsByMonthMap.set(key, (upcomingEventsByMonthMap.get(key) ?? 0) + 1);
    });

    const upcomingEventsByMonth = Array.from(upcomingEventsByMonthMap.entries())
      .map(([month, value]) => ({
        month,
        monthLabel: formatMonthLabel(month),
        value,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const volunteerRadar = topN(
      volunteers.map((v) => {
        const expertiseCount = splitMultiValue(v["Expertise Tags"]).length;
        const companyCount = splitMultiValue(v.Company).length;
        const hasBoardRole = v["Board Role"] ? 100 : 0;

        return {
          volunteer: v.Name || v.name || "Unknown",
          expertiseCoverage: Math.min(expertiseCount * 20, 100),
          companyBreadth: Math.min(companyCount * 25, 100),
          boardSignal: hasBoardRole,
        };
      }),
      8
    );

    const regionCoverage = eventRegions.map((regionRow) => {
      const volunteerCount =
        volunteerRegions.find((v) => v.name === regionRow.name)?.value ?? 0;

      return {
        region: regionRow.name,
        events: regionRow.value,
        volunteers: volunteerCount,
      };
    });

    return {
      totalCourses,
      totalCalendarEvents,
      totalContacts,
      totalUsers,
      totalVolunteers,
      coursesWithGuestLectureFit,
      usersWithRecentLogin,
      volunteersPerUser: ratio(totalVolunteers, totalUsers),
      guestLectureCoverageRate: pct(coursesWithGuestLectureFit, totalCourses),
      userActivationRate: pct(usersWithRecentLogin, totalUsers),
      volunteerRegions: topN(volunteerRegions, 8),
      userRoles: topN(userRoles, 8),
      eventRegions: topN(eventRegions, 8),
      contactCategories: topN(contactCategories, 10),
      courseModes: topN(courseModes, 8),
      guestLectureFit: topN(guestLectureFit, 8),
      courseDays: topN(courseDays, 8),
      monthlyTrend,
      upcomingEventsByMonth,
      volunteerRadar,
      regionCoverage: topN(regionCoverage, 8),
    };
  }, [courses, eventCalendar, eventContacts, users, volunteers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 pt-28">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-lg font-medium text-slate-900">
            Loading IA West KPI dashboard...
          </div>
          <div className="mt-2 text-slate-600">
            Waiting for live Firebase data from courses, event calendar, contacts,
            users, and volunteers.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 pt-28">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-300">
                IA West CRM
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Live courses, events, contacts, users, and volunteer coverage
              </h1>
              <p className="mt-3 max-w-3xl text-slate-200">
                Operational view of course inventory, IA event planning, contact
                coverage, account activity, and volunteer distribution based on the
                collections currently in Firestore.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:min-w-[360px]">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-xs text-slate-300">Volunteers per User</div>
                <div className="mt-1 text-2xl font-semibold">
                  {metrics.volunteersPerUser}x
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-xs text-slate-300">Guest Lecture Coverage</div>
                <div className="mt-1 text-2xl font-semibold">
                  {metrics.guestLectureCoverageRate}%
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-xs text-slate-300">User Activation</div>
                <div className="mt-1 text-2xl font-semibold">
                  {metrics.userActivationRate}%
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-xs text-slate-300">Planned IA Events</div>
                <div className="mt-1 text-2xl font-semibold">
                  {metrics.totalCalendarEvents}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {kpiCard(
            "Courses",
            metrics.totalCourses,
            "Course records currently available in Firestore"
          )}
          {kpiCard(
            "Event Calendar",
            metrics.totalCalendarEvents,
            "Planned IA event timing and region records",
            "success"
          )}
          {kpiCard(
            "Event Contacts",
            metrics.totalContacts,
            "Contactable programs and outreach records"
          )}
          {kpiCard(
            "Users",
            metrics.totalUsers,
            `${metrics.userActivationRate}% have a recorded login timestamp`,
            "warning"
          )}
          {kpiCard(
            "Volunteers",
            metrics.totalVolunteers,
            `${metrics.volunteersPerUser} volunteers per user`,
            "success"
          )}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Monthly record activity
              </h2>
              <p className="text-sm text-slate-500">
                Records grouped by update or creation month across collections.
              </p>
            </div>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.monthlyTrend} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="monthLabel" stroke="#64748b" />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="courses" fill={CHART_COLORS.blue} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="events" fill={CHART_COLORS.violet} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="contacts" fill={CHART_COLORS.emerald} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="users" fill={CHART_COLORS.amber} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="volunteers" fill={CHART_COLORS.rose} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Upcoming IA events by month
              </h2>
              <p className="text-sm text-slate-500">
                Counts based on the event calendar&apos;s IA Event Date.
              </p>
            </div>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.upcomingEventsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="monthLabel" stroke="#64748b" />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Events" fill={CHART_COLORS.blue} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Event coverage by region
              </h2>
              <p className="text-sm text-slate-500">
                Compares planned regional events against volunteer presence.
              </p>
            </div>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.regionCoverage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="region" stroke="#64748b" />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="events" fill={CHART_COLORS.violet} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="volunteers" fill={CHART_COLORS.emerald} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Event contacts by category
              </h2>
              <p className="text-sm text-slate-500">
                Distribution of outreachable programs by category.
              </p>
            </div>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...metrics.contactCategories].reverse()}
                  layout="vertical"
                  margin={{ top: 8, right: 16, bottom: 8, left: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#64748b"
                    width={130}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill={CHART_COLORS.indigo} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Courses by delivery mode
              </h2>
              <p className="text-sm text-slate-500">
                Hybrid, async, and other delivery mix across course records.
              </p>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.courseModes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill={CHART_COLORS.cyan} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Guest lecture fit
              </h2>
              <p className="text-sm text-slate-500">
                Readiness distribution for course-level guest lecture opportunities.
              </p>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.guestLectureFit}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill={CHART_COLORS.amber} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Volunteers by metro region
              </h2>
              <p className="text-sm text-slate-500">
                Where volunteer supply is currently concentrated.
              </p>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.volunteerRegions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill={CHART_COLORS.emerald} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Users by role</h2>
              <p className="text-sm text-slate-500">
                Account mix by application role.
              </p>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.userRoles}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill={CHART_COLORS.rose} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Course day distribution
              </h2>
              <p className="text-sm text-slate-500">
                Frequency of meeting-day patterns across course records.
              </p>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.courseDays}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill={CHART_COLORS.slate} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Volunteer profile strength
              </h2>
              <p className="text-sm text-slate-500">
                Proxy comparison using expertise tags, company breadth, and board
                role presence.
              </p>
            </div>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={metrics.volunteerRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="volunteer" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis />
                  <Radar
                    dataKey="expertiseCoverage"
                    stroke={CHART_COLORS.blue}
                    fill={CHART_COLORS.blue}
                    fillOpacity={0.2}
                  />
                  <Radar
                    dataKey="companyBreadth"
                    stroke={CHART_COLORS.violet}
                    fill={CHART_COLORS.violet}
                    fillOpacity={0.2}
                  />
                  <Radar
                    dataKey="boardSignal"
                    stroke={CHART_COLORS.emerald}
                    fill={CHART_COLORS.emerald}
                    fillOpacity={0.2}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              What this dashboard now reflects
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">
                1. Actual Firestore collections in the project, not hypothetical
                opportunities or match feedback tables.
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                2. Operational supply-and-demand signals across courses, event
                planning, contacts, users, and volunteers.
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                3. Region, role, category, and timing visibility that matches the
                data shown in your Firebase console.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}