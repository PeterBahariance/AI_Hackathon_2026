'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  Loader2, ArrowLeft, User, Calendar, Zap, BookOpen,
  Users, GraduationCap,
} from 'lucide-react';

interface CourseData {
  Instructor: string;
  Course: string;
  Section: string;
  Title: string;
  Days: string;
  'Start Time': string;
  'End Time': string;
  'Enrl Cap': string;
  Mode: string;
  'Guest Lecture Fit': string;
}

const getFitStyles = (fit: string) => {
  switch (fit?.toLowerCase()) {
    case 'high': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'medium': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
    case 'low': return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
  }
};

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const docRef = doc(db, 'courses', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCourse(docSnap.data() as CourseData);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-20 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-20 flex flex-col items-center justify-center">
        <p className="text-slate-500 font-bold mb-4">Course not found</p>
        <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const fit = getFitStyles(course['Guest Lecture Fit']);
  const enrollmentCap = parseInt(course['Enrl Cap'] || '30', 10);

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">

        {/* Back */}
        <Link
          href="/opportunities/courses"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-bold text-sm group mb-8"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Course Catalog
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-8 md:p-10 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                  {course.Course} &middot; Sec {course.Section}
                </span>
                <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg border ${fit.bg} ${fit.text} ${fit.border}`}>
                  {course['Guest Lecture Fit']} Guest Lecture Fit
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                {course.Title}
              </h1>
              <p className="text-slate-500 text-sm">Cal Poly Pomona &middot; College of Business Administration</p>
            </div>
            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <GraduationCap size={36} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Instructor */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instructor</p>
                <p className="text-lg font-bold text-slate-900">{course.Instructor}</p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule</p>
                <p className="text-lg font-bold text-slate-900">{course.Days}</p>
                <p className="text-sm text-slate-500">{course['Start Time']} — {course['End Time']}</p>
              </div>
            </div>
          </div>

          {/* Mode */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Zap size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teaching Mode</p>
                <p className="text-lg font-bold text-slate-900">{course.Mode}</p>
              </div>
            </div>
          </div>

          {/* Enrollment */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrollment Cap</p>
                <p className="text-lg font-bold text-slate-900">{enrollmentCap} students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Match CTA */}
        <div className="bg-white rounded-2xl border border-blue-100 p-8 text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Find the best volunteer for this course
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Use the matching engine to find board members whose expertise aligns with this course.
          </p>
          <Link
            href={`/matching?tab=courses&opp=${id}`}
            className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/40"
          >
            <BookOpen size={16} />
            Match Volunteer to This Course
          </Link>
        </div>

      </div>
    </div>
  );
}
