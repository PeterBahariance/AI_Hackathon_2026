"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function SupplyPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "volunteers"));
        const volunteerList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVolunteers(volunteerList);
      } catch (error) {
        console.error("Error fetching volunteers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteers();
  }, []);

  if (loading) return <div className="p-10">Loading volunteers...</div>;

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">IA West Volunteers</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {volunteers.map((person) => (
          <div key={person.id} className="border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
            <h2 className="text-xl font-bold text-blue-600">{person.Name}</h2>
            <p className="text-gray-700 font-medium">{person.Title}</p>
            <p className="text-gray-500 text-sm mb-4">{person.Company}</p>
            
            <div className="mb-4">
              <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded">
                📍 {person["Metro Region"]}
              </span>
            </div>

            <Link 
              href={`/supply/${person.id}`}
              className="inline-block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Profile
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}