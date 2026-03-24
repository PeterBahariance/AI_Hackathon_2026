"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function DetailPage() {
  const { id } = useParams(); 
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      const docRef = doc(db, "opportunities", id as string); 
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setData(docSnap.data());
      }
    }
    fetchData();
  }, [id]);

  if (!data) return <div className="p-20 text-center text-slate-500">Loading details...</div>;

  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-6" style={{ fontFamily: "Georgia, serif" }}>
        {data.Name || data.title || "Detail View"}
      </h1>
      <div className="bg-white border rounded-xl p-8 shadow-sm">
        {/* This dynamically renders all keys from your CSV/Firestore */}
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="mb-4 border-b pb-2">
            <span className="font-bold text-slate-700 uppercase text-xs tracking-wider">{key}</span>
            <p className="text-lg text-slate-900">{String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}