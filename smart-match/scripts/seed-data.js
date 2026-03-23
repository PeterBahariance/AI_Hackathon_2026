const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Ensure this path is correct based on your local folder structure
const serviceAccount = require(path.join(__dirname, "../serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Generates a consistent ID based on the data to prevent duplicates
 */
function generateId(row, collectionName) {
  let rawId = "";
  
  if (collectionName === 'event_calendar') {
    // Unique ID: Date + University
    rawId = `${row["IA Event Date"]}-${row["Nearby Universities"]}`;
  } else if (collectionName === 'courses') {
    // Unique ID: Course Name/Number
    rawId = `${row["Course Name"] || row["Course"]}`;
  } else if (collectionName === 'volunteers') {
    // Unique ID: Name
    rawId = `${row["Name"]}`;
  } else {
    // Fallback for others: use first two columns
    rawId = Object.values(row).slice(0, 2).join("-");
  }

  return rawId.replace(/\s+/g, '_').replace(/[./]/g, '-').toLowerCase();
}

async function uploadCSV(fileName, collectionName) {
  const filePath = path.join(__dirname, "../../data", fileName);
  const results = [];

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`🚀 Starting upload for ${collectionName} (${results.length} rows)...`);
      
      const batch = db.batch(); // Optional: Use batches for faster uploads
      
      try {
        for (const row of results) {
          const customId = generateId(row, collectionName);
          const docRef = db.collection(collectionName).doc(customId);
          
          // .set() overwrites instead of .add() which duplicates
          await docRef.set({
            ...row,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        console.log(`✅ Successfully synced ${collectionName} (Duplicates prevented)`);
      } catch (error) {
        console.error(`❌ Error uploading to ${collectionName}:`, error.message);
      }
    });
}

uploadCSV('data_cpp_course_schedule.csv', 'courses');
uploadCSV('data_cpp_events_contacts.csv', 'events_contacts');
uploadCSV('data_event_calendar.csv', 'event_calendar');
uploadCSV('data_speaker_profiles.csv', 'volunteers');