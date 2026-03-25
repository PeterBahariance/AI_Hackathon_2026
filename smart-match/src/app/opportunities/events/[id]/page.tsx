'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  Loader2, ArrowLeft, MapPin, Calendar, Clock, BookOpen, Users,
} from 'lucide-react';

interface IAEvent {
  'IA Event Date': string;
  Region: string;
  'Nearby Universities': string;
  'Suggested Lecture Window': string;
  'Course Alignment': string;
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = decodeURIComponent(resolvedParams.id);

  const [event, setEvent] = useState<IAEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const docRef = doc(db, 'event_calendar', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent(docSnap.data() as IAEvent);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-20 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#471f8d]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-20 flex flex-col items-center justify-center">
        <p className="text-slate-500 font-bold mb-4">Event not found</p>
        <button onClick={() => router.back()} className="text-[#471f8d] font-bold hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">

        {/* Back */}
        <Link
          href="/opportunities/events"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-[#471f8d] transition-colors font-bold text-sm group mb-8"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to IA Events
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-3xl border border-[#dbbde5] shadow-sm overflow-hidden mb-8">
          <div className="bg-[#471f8d] p-8 text-white">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 mb-2 block">
              {event.Region}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
              {event['Nearby Universities']}
            </h1>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#f4efff] flex items-center justify-center shrink-0">
                  <Calendar size={20} className="text-[#471f8d]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Date</p>
                  <p className="text-lg font-bold text-slate-900">{event['IA Event Date']}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#f4efff] flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-[#471f8d]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Region</p>
                  <p className="text-lg font-bold text-slate-900">{event.Region}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#f4efff] flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-[#471f8d]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suggested Lecture Window</p>
                  <p className="text-lg font-bold text-slate-900">{event['Suggested Lecture Window']}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#f4efff] flex items-center justify-center shrink-0">
                  <Users size={20} className="text-[#471f8d]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nearby Universities</p>
                  <p className="text-lg font-bold text-slate-900">{event['Nearby Universities']}</p>
                </div>
              </div>
            </div>

            {/* Course Alignment */}
            <div className="bg-[#f9f5ff] p-6 rounded-2xl border border-[#dbbde5]">
              <h3 className="text-[10px] font-bold text-[#471f8d] uppercase tracking-widest mb-2">Course Alignment</h3>
              <p className="text-slate-700 leading-relaxed italic text-lg">
                &ldquo;{event['Course Alignment']}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Match CTA */}
        <div className="bg-white rounded-2xl border border-[#dbbde5] p-8 text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Find the best volunteer for this event
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Use the matching engine to find board members by expertise, region, and role fit.
          </p>
          <Link
            href={`/matching?tab=ia-events&opp=${id}`}
            className="inline-flex items-center gap-3 bg-[#471f8d] text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-[#36176d] transition-all shadow-lg hover:shadow-[#471f8d]/40"
          >
            <BookOpen size={16} />
            Match Volunteer to This Event
          </Link>
        </div>

      </div>
    </div>
  );
}
