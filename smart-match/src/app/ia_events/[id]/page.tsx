"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface IAEvent {
  "IA Event Date": string;
  Region: string;
  "Nearby Universities": string;
  "Suggested Lecture Window": string;
  "Course Alignment": string;
}

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<IAEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;
      try {
        const docRef = doc(db, "event_calendar", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEvent(docSnap.data() as IAEvent);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  if (loading) return <div className="p-20 text-center text-[#471f8d] animate-pulse">Loading Event Details...</div>;
  if (!event) return <div className="p-20 text-center">Event not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="mb-6 text-[#471f8d] font-semibold hover:underline flex items-center gap-2"
        >
          ← Back to Calendar
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#dbbde5]">
          {/* Header Section */}
          <div className="bg-[#471f8d] p-8 text-white">
            <div className="uppercase tracking-widest text-xs font-bold text-[#dbbde5] mb-2">
              Region: {event.Region}
            </div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "Georgia, serif" }}>
              IA Event: {event["IA Event Date"]}
            </h1>
          </div>

          {/* Body Section */}
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nearby Universities</h3>
                <p className="text-lg text-gray-900 font-medium">{event["Nearby Universities"]}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Suggested Window</h3>
                <p className="text-lg text-gray-900 font-medium">{event["Suggested Lecture Window"]}</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="bg-[#f9f5ff] p-6 rounded-xl border border-[#dbbde5]">
              <h3 className="text-xs font-bold text-[#471f8d] uppercase tracking-wider mb-2">Course Alignment</h3>
              <p className="text-gray-700 leading-relaxed italic text-lg">
                "{event["Course Alignment"]}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}