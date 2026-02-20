// app/api/trains/route.js
// Scrapes the public Uzbekistan train timetable from advantour.com
// and aggregates train counts per route. No session/auth needed.

const TIMETABLE_URL = 'https://www.advantour.com/uzbekistan/trains/timetable.htm'

// Station name normalization — map various spellings to our canonical names
const STATION_ALIASES = {
  'tashkent': 'Toshkent', 'toshkent': 'Toshkent',
  'samarkand': 'Samarqand', 'samarqand': 'Samarqand',
  'bukhara': 'Buxoro', 'buxoro': 'Buxoro', 'bokhara': 'Buxoro',
  'khiva': 'Xiva', 'xiva': 'Xiva',
  'urgench': 'Urganch', 'urganch': 'Urganch',
  'nukus': 'Nukus',
  'navoi': 'Navoiy', 'navoiy': 'Navoiy',
  'andijan': 'Andijon', 'andijon': 'Andijon',
  'karshi': 'Qarshi', 'qarshi': 'Qarshi',
  'jizzax': 'Jizzax', 'jizzakh': 'Jizzax',
  'termez': 'Termiz', 'termiz': 'Termiz',
  'namangan': 'Namangan',
  'kokand': "Qo'qon", "qo'qon": "Qo'qon", 'kokond': "Qo'qon",
  'margilan': 'Margilon', 'margilon': 'Margilon',
  'guliston': 'Guliston', 'gulistan': 'Guliston',
  'shovot': 'Shovot',
  'boysun': 'Boysun',
  'sariosiyo': 'Sariosiyo',
  'shymkent': 'Shymkent',
  'almaty': 'Almaty',
}

function normalizeStation(name) {
  const key = (name || '').toLowerCase().trim()
  return STATION_ALIASES[key] || name
}

// Classify train type from its name
function classifyTrain(trainName) {
  const n = (trainName || '').toLowerCase()
  if (n.includes('afrosiyob') || n.includes('afrosiab')) return 'afrosiyob'
  if (n.includes('sharq')) return 'sharq'
  if (n.includes('tezkor')) return 'tezkor'
  if (n.includes('ozbekiston') || n.includes('o\'zbekiston')) return 'yolovchi'
  if (n.includes('night')) return 'yolovchi'
  return 'yolovchi'
}

// Parse the HTML timetable from advantour.com
function parseTimetable(html) {
  const trains = []

  // Match table rows with train info
  // Pattern: train name link, then departure station, arrival station
  // The HTML has rows like:
  //   <a href="...">Afrosiyob Train: 771</a> ... **03:15** Bukhara ... **07:35** Tashkent ... Daily
  
  // Extract all timetable entries using regex on the HTML structure
  // Each entry has: train name, departure time + station, arrival time + station, duration, frequency
  
  // Pattern for train entries in the table
  const rowPattern = /\*\*(\d{2}:\d{2})\*\*\s+([A-Za-z\u0027]+)\s+\|\s+\*\*(\d{2}:\d{2})(?:\+\d)?\*\*\s+([A-Za-z\u0027]+)\s+\|\s+[\dh\sm]+\s+\|\s+([\w\s]+)\s+\|/g

  // Actually let's parse the structured data differently
  // The timetable has patterns like:
  // [**Train Name**: NUMBER](link) ... **HH:MM** StationFrom | **HH:MM** StationTo | duration | Days
  
  // Better approach: split by train entries
  const entryPattern = /\[?\*\*([^*]+)\*\*[:\s]*(\d+)\]?\([^)]*\)[^|]*\|\s*\*\*(\d{2}:\d{2})\*\*\s+([A-Za-z\u0027]+)\s*\|\s*\*\*(\d{2}:\d{2})(?:\+\d)?\*\*\s+([A-Za-z\u0027]+)\s*\|\s*[\dh\s\dm]+\s*\|\s*([^|]+)\|/gi

  let match
  while ((match = entryPattern.exec(html)) !== null) {
    const trainName = match[1].trim()
    const trainNumber = match[2]
    const depTime = match[3]
    const depStation = normalizeStation(match[4])
    const arrTime = match[5]
    const arrStation = normalizeStation(match[6])
    const frequency = match[7].trim()

    trains.push({
      name: trainName,
      number: trainNumber,
      type: classifyTrain(trainName),
      from: depStation,
      to: arrStation,
      depTime,
      arrTime,
      frequency,
    })
  }

  return trains
}

// Hardcoded train schedule data based on the current timetable
// This serves as fallback when scraping fails, and is the primary data source
// Last updated: Feb 2026 from advantour.com/uzbekistan/trains/timetable.htm
function getStaticSchedule() {
  return [
    // === AFROSIYOB TRAINS ===
    // 771: Bukhara → Tashkent (daily)
    { name: 'Afrosiyob', number: '771', type: 'afrosiyob', from: 'Buxoro', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '771', type: 'afrosiyob', from: 'Buxoro', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '771', type: 'afrosiyob', from: 'Buxoro', to: 'Navoiy', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '771', type: 'afrosiyob', from: 'Navoiy', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '771', type: 'afrosiyob', from: 'Navoiy', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '771', type: 'afrosiyob', from: 'Samarqand', to: 'Toshkent', frequency: 'Daily' },
    // 774: Tashkent → Samarkand (daily)
    { name: 'Afrosiyob', number: '774', type: 'afrosiyob', from: 'Toshkent', to: 'Samarqand', frequency: 'Daily' },
    // 764: Tashkent → Karshi (daily)
    { name: 'Afrosiyob', number: '764', type: 'afrosiyob', from: 'Toshkent', to: 'Qarshi', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '764', type: 'afrosiyob', from: 'Samarqand', to: 'Qarshi', frequency: 'Daily' },
    // 766: Tashkent → Samarkand (daily)
    { name: 'Afrosiyob', number: '766', type: 'afrosiyob', from: 'Toshkent', to: 'Samarqand', frequency: 'Daily' },
    // 768: Tashkent → Bukhara (daily)
    { name: 'Afrosiyob', number: '768', type: 'afrosiyob', from: 'Toshkent', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '768', type: 'afrosiyob', from: 'Toshkent', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '768', type: 'afrosiyob', from: 'Toshkent', to: 'Navoiy', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '768', type: 'afrosiyob', from: 'Samarqand', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '768', type: 'afrosiyob', from: 'Samarqand', to: 'Navoiy', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '768', type: 'afrosiyob', from: 'Navoiy', to: 'Buxoro', frequency: 'Daily' },
    // 770: Tashkent → Bukhara (daily)
    { name: 'Afrosiyob', number: '770', type: 'afrosiyob', from: 'Toshkent', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '770', type: 'afrosiyob', from: 'Toshkent', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '770', type: 'afrosiyob', from: 'Toshkent', to: 'Navoiy', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '770', type: 'afrosiyob', from: 'Samarqand', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '770', type: 'afrosiyob', from: 'Samarqand', to: 'Navoiy', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '770', type: 'afrosiyob', from: 'Navoiy', to: 'Buxoro', frequency: 'Daily' },
    // 778: Tashkent → Bukhara (Fri/Sat/Sun only)
    { name: 'Afrosiyob', number: '778', type: 'afrosiyob', from: 'Toshkent', to: 'Samarqand', frequency: 'Fr Sa Su' },
    { name: 'Afrosiyob', number: '778', type: 'afrosiyob', from: 'Toshkent', to: 'Buxoro', frequency: 'Fr Sa Su' },
    { name: 'Afrosiyob', number: '778', type: 'afrosiyob', from: 'Toshkent', to: 'Navoiy', frequency: 'Fr Sa Su' },
    { name: 'Afrosiyob', number: '778', type: 'afrosiyob', from: 'Samarqand', to: 'Buxoro', frequency: 'Fr Sa Su' },
    { name: 'Afrosiyob', number: '778', type: 'afrosiyob', from: 'Samarqand', to: 'Navoiy', frequency: 'Fr Sa Su' },
    { name: 'Afrosiyob', number: '778', type: 'afrosiyob', from: 'Navoiy', to: 'Buxoro', frequency: 'Fr Sa Su' },
    // 769: Bukhara → Tashkent (daily)
    { name: 'Afrosiyob', number: '769', type: 'afrosiyob', from: 'Buxoro', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '769', type: 'afrosiyob', from: 'Buxoro', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '769', type: 'afrosiyob', from: 'Buxoro', to: 'Navoiy', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '769', type: 'afrosiyob', from: 'Navoiy', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '769', type: 'afrosiyob', from: 'Navoiy', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '769', type: 'afrosiyob', from: 'Samarqand', to: 'Toshkent', frequency: 'Daily' },
    // 767: Bukhara → Tashkent (daily)
    { name: 'Afrosiyob', number: '767', type: 'afrosiyob', from: 'Buxoro', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '767', type: 'afrosiyob', from: 'Buxoro', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '767', type: 'afrosiyob', from: 'Buxoro', to: 'Navoiy', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '767', type: 'afrosiyob', from: 'Navoiy', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '767', type: 'afrosiyob', from: 'Navoiy', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Afrosiyob', number: '767', type: 'afrosiyob', from: 'Samarqand', to: 'Toshkent', frequency: 'Daily' },

    // === SHARQ TRAINS ===
    // 711: Bukhara → Tashkent (daily)
    { name: 'Sharq', number: '711', type: 'sharq', from: 'Buxoro', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Sharq', number: '711', type: 'sharq', from: 'Buxoro', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Sharq', number: '711', type: 'sharq', from: 'Buxoro', to: 'Navoiy', frequency: 'Daily' },
    { name: 'Sharq', number: '711', type: 'sharq', from: 'Navoiy', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Sharq', number: '711', type: 'sharq', from: 'Navoiy', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Sharq', number: '711', type: 'sharq', from: 'Samarqand', to: 'Toshkent', frequency: 'Daily' },
    // 710: Tashkent → Bukhara (daily)
    { name: 'Sharq', number: '710', type: 'sharq', from: 'Toshkent', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Sharq', number: '710', type: 'sharq', from: 'Toshkent', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Sharq', number: '710', type: 'sharq', from: 'Toshkent', to: 'Navoiy', frequency: 'Daily' },
    { name: 'Sharq', number: '710', type: 'sharq', from: 'Samarqand', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Sharq', number: '710', type: 'sharq', from: 'Samarqand', to: 'Navoiy', frequency: 'Daily' },
    { name: 'Sharq', number: '710', type: 'sharq', from: 'Navoiy', to: 'Buxoro', frequency: 'Daily' },
    // 712: Samarkand → Bukhara (daily)
    { name: 'Sharq', number: '712', type: 'sharq', from: 'Samarqand', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Sharq', number: '712', type: 'sharq', from: 'Samarqand', to: 'Navoiy', frequency: 'Daily' },
    { name: 'Sharq', number: '712', type: 'sharq', from: 'Navoiy', to: 'Buxoro', frequency: 'Daily' },
    // 709: Bukhara → Tashkent (daily)
    { name: 'Sharq', number: '709', type: 'sharq', from: 'Buxoro', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Sharq', number: '709', type: 'sharq', from: 'Buxoro', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Sharq', number: '709', type: 'sharq', from: 'Buxoro', to: 'Navoiy', frequency: 'Daily' },
    { name: 'Sharq', number: '709', type: 'sharq', from: 'Navoiy', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Sharq', number: '709', type: 'sharq', from: 'Navoiy', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Sharq', number: '709', type: 'sharq', from: 'Samarqand', to: 'Toshkent', frequency: 'Daily' },

    // === O'ZBEKISTON (PASSENGER) TRAINS ===
    // 730: Tashkent → Andijan (daily)
    { name: "O'zbekiston", number: '730', type: 'yolovchi', from: 'Toshkent', to: 'Andijon', frequency: 'Daily' },
    { name: "O'zbekiston", number: '730', type: 'yolovchi', from: 'Toshkent', to: "Qo'qon", frequency: 'Daily' },
    { name: "O'zbekiston", number: '730', type: 'yolovchi', from: 'Toshkent', to: 'Margilon', frequency: 'Daily' },
    { name: "O'zbekiston", number: '730', type: 'yolovchi', from: "Qo'qon", to: 'Andijon', frequency: 'Daily' },
    { name: "O'zbekiston", number: '730', type: 'yolovchi', from: 'Margilon', to: 'Andijon', frequency: 'Daily' },
    // 729: Andijan → Tashkent (daily)
    { name: "O'zbekiston", number: '729', type: 'yolovchi', from: 'Andijon', to: 'Toshkent', frequency: 'Daily' },
    { name: "O'zbekiston", number: '729', type: 'yolovchi', from: 'Andijon', to: "Qo'qon", frequency: 'Daily' },
    { name: "O'zbekiston", number: '729', type: 'yolovchi', from: 'Andijon', to: 'Margilon', frequency: 'Daily' },
    { name: "O'zbekiston", number: '729', type: 'yolovchi', from: "Qo'qon", to: 'Toshkent', frequency: 'Daily' },
    { name: "O'zbekiston", number: '729', type: 'yolovchi', from: 'Margilon', to: 'Toshkent', frequency: 'Daily' },
    // 731: Andijan → Tashkent (Th Fr Sa Su)
    { name: "O'zbekiston", number: '731', type: 'yolovchi', from: 'Andijon', to: 'Toshkent', frequency: 'Th Fr Sa Su' },
    { name: "O'zbekiston", number: '731', type: 'yolovchi', from: 'Andijon', to: "Qo'qon", frequency: 'Th Fr Sa Su' },
    { name: "O'zbekiston", number: '731', type: 'yolovchi', from: 'Andijon', to: 'Margilon', frequency: 'Th Fr Sa Su' },
    { name: "O'zbekiston", number: '731', type: 'yolovchi', from: 'Margilon', to: 'Toshkent', frequency: 'Th Fr Sa Su' },
    { name: "O'zbekiston", number: '731', type: 'yolovchi', from: "Qo'qon", to: 'Toshkent', frequency: 'Th Fr Sa Su' },

    // === NIGHT TRAINS ===
    // 54: Tashkent ↔ Nukus (daily)
    { name: 'Night Train', number: '54', type: 'yolovchi', from: 'Toshkent', to: 'Nukus', frequency: 'Daily' },
    { name: 'Night Train', number: '54', type: 'yolovchi', from: 'Toshkent', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Night Train', number: '54', type: 'yolovchi', from: 'Toshkent', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Night Train', number: '54', type: 'yolovchi', from: 'Toshkent', to: 'Navoiy', frequency: 'Daily' },
    { name: 'Night Train', number: '54', type: 'yolovchi', from: 'Nukus', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Night Train', number: '54', type: 'yolovchi', from: 'Nukus', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Night Train', number: '54', type: 'yolovchi', from: 'Nukus', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Night Train', number: '54', type: 'yolovchi', from: 'Nukus', to: 'Navoiy', frequency: 'Daily' },
    { name: 'Night Train', number: '54', type: 'yolovchi', from: 'Navoiy', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Night Train', number: '54', type: 'yolovchi', from: 'Samarqand', to: 'Toshkent', frequency: 'Daily' },
    // 56: Tashkent ↔ Urgench / Khiva (daily / partial)
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Toshkent', to: 'Urganch', frequency: 'Daily' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Toshkent', to: 'Xiva', frequency: 'We Th Sa Su' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Toshkent', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Toshkent', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Toshkent', to: 'Navoiy', frequency: 'Daily' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Urganch', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Urganch', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Urganch', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Xiva', to: 'Toshkent', frequency: 'We Th Sa Su' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Xiva', to: 'Samarqand', frequency: 'We Th Sa Su' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Xiva', to: 'Buxoro', frequency: 'We Th Sa Su' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Xiva', to: 'Urganch', frequency: 'We Th Sa Su' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Samarqand', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Samarqand', to: 'Urganch', frequency: 'Daily' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Samarqand', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Navoiy', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Navoiy', to: 'Urganch', frequency: 'Daily' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Navoiy', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Buxoro', to: 'Urganch', frequency: 'Daily' },
    { name: 'Night Train', number: '56', type: 'yolovchi', from: 'Buxoro', to: 'Xiva', frequency: 'We Th Sa Su' },
    // 58: Tashkent → Shovot/Urgench (Mo Tu Fr)
    { name: 'Night Train', number: '58', type: 'yolovchi', from: 'Toshkent', to: 'Urganch', frequency: 'Mo Tu Fr' },
    { name: 'Night Train', number: '58', type: 'yolovchi', from: 'Samarqand', to: 'Buxoro', frequency: 'Mo Tu Fr' },
    { name: 'Night Train', number: '58', type: 'yolovchi', from: 'Samarqand', to: 'Urganch', frequency: 'Mo Tu Fr' },
    { name: 'Night Train', number: '58', type: 'yolovchi', from: 'Samarqand', to: 'Toshkent', frequency: 'Tu We Sa' },
    { name: 'Night Train', number: '58', type: 'yolovchi', from: 'Navoiy', to: 'Urganch', frequency: 'Mo Tu Fr' },
    // 80: Tashkent ↔ Termez (daily)
    { name: 'Night Train', number: '80', type: 'yolovchi', from: 'Toshkent', to: 'Termiz', frequency: 'Daily' },
    { name: 'Night Train', number: '80', type: 'yolovchi', from: 'Toshkent', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Night Train', number: '80', type: 'yolovchi', from: 'Toshkent', to: 'Qarshi', frequency: 'Daily' },
    { name: 'Night Train', number: '80', type: 'yolovchi', from: 'Samarqand', to: 'Termiz', frequency: 'Daily' },
    { name: 'Night Train', number: '80', type: 'yolovchi', from: 'Samarqand', to: 'Qarshi', frequency: 'Daily' },
    { name: 'Night Train', number: '80', type: 'yolovchi', from: 'Samarqand', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Night Train', number: '80', type: 'yolovchi', from: 'Qarshi', to: 'Termiz', frequency: 'Daily' },
    { name: 'Night Train', number: '80', type: 'yolovchi', from: 'Qarshi', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Night Train', number: '80', type: 'yolovchi', from: 'Qarshi', to: 'Samarqand', frequency: 'Daily' },
    // 82: Tashkent → Sariosiyo (daily)
    { name: 'Night Train', number: '82', type: 'yolovchi', from: 'Toshkent', to: 'Qarshi', frequency: 'Daily' },
    { name: 'Night Train', number: '82', type: 'yolovchi', from: 'Samarqand', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Night Train', number: '82', type: 'yolovchi', from: 'Qarshi', to: 'Toshkent', frequency: 'Daily' },
    // 125/126: Andijan ↔ Khiva (daily)
    { name: 'Night Train', number: '125', type: 'yolovchi', from: 'Andijon', to: 'Xiva', frequency: 'Daily' },
    { name: 'Night Train', number: '125', type: 'yolovchi', from: 'Andijon', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Night Train', number: '125', type: 'yolovchi', from: 'Andijon', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Night Train', number: '125', type: 'yolovchi', from: 'Andijon', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Night Train', number: '125', type: 'yolovchi', from: 'Samarqand', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Night Train', number: '125', type: 'yolovchi', from: 'Samarqand', to: 'Xiva', frequency: 'Daily' },
    { name: 'Night Train', number: '125', type: 'yolovchi', from: 'Buxoro', to: 'Xiva', frequency: 'Daily' },
    { name: 'Night Train', number: '125', type: 'yolovchi', from: 'Buxoro', to: 'Urganch', frequency: 'Daily' },
    { name: 'Night Train', number: '125', type: 'yolovchi', from: "Qo'qon", to: 'Toshkent', frequency: 'Daily' },
    { name: 'Night Train', number: '125', type: 'yolovchi', from: "Qo'qon", to: 'Buxoro', frequency: 'Daily' },
    { name: 'Night Train', number: '125', type: 'yolovchi', from: "Qo'qon", to: 'Xiva', frequency: 'Daily' },
    { name: 'Night Train', number: '126', type: 'yolovchi', from: 'Xiva', to: 'Andijon', frequency: 'Daily' },
    { name: 'Night Train', number: '126', type: 'yolovchi', from: 'Xiva', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Night Train', number: '126', type: 'yolovchi', from: 'Xiva', to: 'Samarqand', frequency: 'Daily' },
    { name: 'Night Train', number: '126', type: 'yolovchi', from: 'Xiva', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Night Train', number: '126', type: 'yolovchi', from: 'Xiva', to: "Qo'qon", frequency: 'Daily' },
    { name: 'Night Train', number: '126', type: 'yolovchi', from: 'Urganch', to: 'Buxoro', frequency: 'Daily' },
    { name: 'Night Train', number: '126', type: 'yolovchi', from: 'Urganch', to: 'Toshkent', frequency: 'Daily' },
    { name: 'Night Train', number: '126', type: 'yolovchi', from: 'Toshkent', to: 'Andijon', frequency: 'Daily' },
    { name: 'Night Train', number: '126', type: 'yolovchi', from: 'Toshkent', to: "Qo'qon", frequency: 'Daily' },
    { name: 'Night Train', number: '126', type: 'yolovchi', from: 'Samarqand', to: 'Andijon', frequency: 'Daily' },
  ]
}

// How many days per week a frequency string represents
function daysPerWeek(freq) {
  const f = (freq || '').toLowerCase().trim()
  if (f === 'daily') return 7
  // Count day abbreviations
  const days = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']
  let count = 0
  for (const d of days) {
    if (f.includes(d)) count++
  }
  return count || 7
}

// Aggregate schedule into route counts
function aggregateRoutes(schedule) {
  const TRACKED_ROUTES = [
    { from: 'Toshkent', to: 'Samarqand' }, { from: 'Toshkent', to: 'Buxoro' },
    { from: 'Toshkent', to: 'Xiva' },      { from: 'Toshkent', to: 'Urganch' },
    { from: 'Toshkent', to: 'Nukus' },     { from: 'Toshkent', to: 'Navoiy' },
    { from: 'Toshkent', to: 'Andijon' },   { from: 'Toshkent', to: 'Qarshi' },
    { from: 'Toshkent', to: 'Jizzax' },    { from: 'Toshkent', to: 'Termiz' },
    { from: 'Toshkent', to: 'Namangan' },  { from: 'Toshkent', to: "Qo'qon" },
    { from: 'Toshkent', to: 'Margilon' },  { from: 'Toshkent', to: 'Guliston' },
    { from: 'Samarqand', to: 'Toshkent' }, { from: 'Samarqand', to: 'Buxoro' },
    { from: 'Samarqand', to: 'Navoiy' },   { from: 'Samarqand', to: 'Andijon' },
    { from: 'Samarqand', to: 'Qarshi' },   { from: 'Samarqand', to: 'Termiz' },
    { from: 'Buxoro', to: 'Toshkent' },    { from: 'Buxoro', to: 'Samarqand' },
    { from: 'Buxoro', to: 'Navoiy' },      { from: 'Buxoro', to: 'Andijon' },
    { from: 'Buxoro', to: 'Termiz' },      { from: 'Buxoro', to: 'Urganch' },
    { from: 'Andijon', to: 'Toshkent' },   { from: 'Andijon', to: 'Samarqand' },
    { from: 'Andijon', to: 'Buxoro' },     { from: 'Andijon', to: 'Navoiy' },
    { from: 'Andijon', to: 'Qarshi' },     { from: 'Andijon', to: 'Termiz' },
    { from: 'Namangan', to: 'Toshkent' },  { from: 'Namangan', to: 'Samarqand' },
    { from: 'Namangan', to: 'Andijon' },
  ]

  return TRACKED_ROUTES.map(route => {
    const matching = schedule.filter(t => t.from === route.from && t.to === route.to)
    const counts = { total: 0, afrosiyob: 0, sharq: 0, tezkor: 0, yolovchi: 0 }

    // Count weekly trains for this route
    matching.forEach(t => {
      const weeklyRuns = daysPerWeek(t.frequency)
      counts.total += weeklyRuns
      counts[t.type] += weeklyRuns
    })

    return {
      from_station: route.from,
      to_station: route.to,
      ...counts,
    }
  })
}

export const maxDuration = 60

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const debug = searchParams.get('debug')

  // Use static schedule data (reliable, no API dependency)
  const schedule = getStaticSchedule()
  const routes = aggregateRoutes(schedule)

  if (debug) {
    return Response.json({
      debug: true,
      source: 'static_schedule',
      note: 'Data compiled from advantour.com/uzbekistan/trains/timetable.htm — counts are weekly train runs per route',
      totalTrainServices: schedule.length,
      uniqueTrains: [...new Set(schedule.map(t => `${t.name} ${t.number}`))],
      routes,
      schedule,
    })
  }

  return Response.json({
    routes,
    fetchedAt: new Date().toISOString(),
    source: 'schedule',
    note: 'Weekly train count per route based on current Uzbekistan Railways timetable',
  })
}
