// app/api/trains/route.js
// Schedule data grouped by hub station, per-day breakdown with actual dates

// [trainName, number, type, from, to, daysOfWeek]  (null = daily, else array 0=Mon..6=Sun)
const S = [
  // AFROSIYOB
  ["A","771","a","Buxoro","Toshkent",null],["A","771","a","Buxoro","Samarqand",null],["A","771","a","Buxoro","Navoiy",null],
  ["A","771","a","Navoiy","Toshkent",null],["A","771","a","Navoiy","Samarqand",null],["A","771","a","Samarqand","Toshkent",null],
  ["A","774","a","Toshkent","Samarqand",null],
  ["A","764","a","Toshkent","Qarshi",null],["A","764","a","Samarqand","Qarshi",null],
  ["A","766","a","Toshkent","Samarqand",null],
  ["A","768","a","Toshkent","Samarqand",null],["A","768","a","Toshkent","Buxoro",null],["A","768","a","Toshkent","Navoiy",null],
  ["A","768","a","Samarqand","Buxoro",null],["A","768","a","Samarqand","Navoiy",null],["A","768","a","Navoiy","Buxoro",null],
  ["A","770","a","Toshkent","Samarqand",null],["A","770","a","Toshkent","Buxoro",null],["A","770","a","Toshkent","Navoiy",null],
  ["A","770","a","Samarqand","Buxoro",null],["A","770","a","Samarqand","Navoiy",null],["A","770","a","Navoiy","Buxoro",null],
  ["A","778","a","Toshkent","Samarqand",[4,5,6]],["A","778","a","Toshkent","Buxoro",[4,5,6]],["A","778","a","Toshkent","Navoiy",[4,5,6]],
  ["A","778","a","Samarqand","Buxoro",[4,5,6]],["A","778","a","Samarqand","Navoiy",[4,5,6]],["A","778","a","Navoiy","Buxoro",[4,5,6]],
  ["A","769","a","Buxoro","Toshkent",null],["A","769","a","Buxoro","Samarqand",null],["A","769","a","Buxoro","Navoiy",null],
  ["A","769","a","Navoiy","Toshkent",null],["A","769","a","Navoiy","Samarqand",null],["A","769","a","Samarqand","Toshkent",null],
  ["A","767","a","Buxoro","Toshkent",null],["A","767","a","Buxoro","Samarqand",null],["A","767","a","Buxoro","Navoiy",null],
  ["A","767","a","Navoiy","Toshkent",null],["A","767","a","Navoiy","Samarqand",null],["A","767","a","Samarqand","Toshkent",null],
  // SHARQ
  ["S","711","s","Buxoro","Toshkent",null],["S","711","s","Buxoro","Samarqand",null],["S","711","s","Buxoro","Navoiy",null],
  ["S","711","s","Navoiy","Toshkent",null],["S","711","s","Navoiy","Samarqand",null],["S","711","s","Samarqand","Toshkent",null],
  ["S","710","s","Toshkent","Samarqand",null],["S","710","s","Toshkent","Buxoro",null],["S","710","s","Toshkent","Navoiy",null],
  ["S","710","s","Samarqand","Buxoro",null],["S","710","s","Samarqand","Navoiy",null],["S","710","s","Navoiy","Buxoro",null],
  ["S","712","s","Samarqand","Buxoro",null],["S","712","s","Samarqand","Navoiy",null],["S","712","s","Navoiy","Buxoro",null],
  ["S","709","s","Buxoro","Toshkent",null],["S","709","s","Buxoro","Samarqand",null],["S","709","s","Buxoro","Navoiy",null],
  ["S","709","s","Navoiy","Toshkent",null],["S","709","s","Navoiy","Samarqand",null],["S","709","s","Samarqand","Toshkent",null],
  // YOLOVCHI
  ["Y","730","y","Toshkent","Andijon",null],["Y","730","y","Toshkent","Qo'qon",null],["Y","730","y","Toshkent","Margilon",null],
  ["Y","730","y","Qo'qon","Andijon",null],["Y","730","y","Margilon","Andijon",null],
  ["Y","729","y","Andijon","Toshkent",null],["Y","729","y","Andijon","Qo'qon",null],["Y","729","y","Andijon","Margilon",null],
  ["Y","729","y","Qo'qon","Toshkent",null],["Y","729","y","Margilon","Toshkent",null],
  ["Y","731","y","Andijon","Toshkent",[3,4,5,6]],["Y","731","y","Andijon","Qo'qon",[3,4,5,6]],["Y","731","y","Andijon","Margilon",[3,4,5,6]],
  ["Y","731","y","Margilon","Toshkent",[3,4,5,6]],["Y","731","y","Qo'qon","Toshkent",[3,4,5,6]],
  // NIGHT
  ["N","54","y","Toshkent","Nukus",null],["N","54","y","Toshkent","Samarqand",null],["N","54","y","Toshkent","Buxoro",null],["N","54","y","Toshkent","Navoiy",null],
  ["N","54","y","Nukus","Toshkent",null],["N","54","y","Nukus","Samarqand",null],["N","54","y","Nukus","Buxoro",null],["N","54","y","Nukus","Navoiy",null],
  ["N","54","y","Navoiy","Toshkent",null],["N","54","y","Samarqand","Toshkent",null],
  ["N","56","y","Toshkent","Urganch",null],["N","56","y","Toshkent","Xiva",[2,3,5,6]],
  ["N","56","y","Toshkent","Samarqand",null],["N","56","y","Toshkent","Buxoro",null],["N","56","y","Toshkent","Navoiy",null],
  ["N","56","y","Urganch","Toshkent",null],["N","56","y","Urganch","Samarqand",null],["N","56","y","Urganch","Buxoro",null],
  ["N","56","y","Xiva","Toshkent",[2,3,5,6]],["N","56","y","Xiva","Samarqand",[2,3,5,6]],["N","56","y","Xiva","Buxoro",[2,3,5,6]],["N","56","y","Xiva","Urganch",[2,3,5,6]],
  ["N","56","y","Samarqand","Buxoro",null],["N","56","y","Samarqand","Urganch",null],
  ["N","56","y","Navoiy","Buxoro",null],["N","56","y","Navoiy","Urganch",null],["N","56","y","Navoiy","Toshkent",null],
  ["N","56","y","Buxoro","Urganch",null],["N","56","y","Buxoro","Xiva",[2,3,5,6]],
  ["N","58","y","Toshkent","Urganch",[0,1,4]],
  ["N","58","y","Samarqand","Buxoro",[0,1,4]],["N","58","y","Samarqand","Urganch",[0,1,4]],["N","58","y","Navoiy","Urganch",[0,1,4]],
  ["N","80","y","Toshkent","Termiz",null],["N","80","y","Toshkent","Qarshi",null],
  ["N","80","y","Samarqand","Termiz",null],["N","80","y","Samarqand","Qarshi",null],
  ["N","80","y","Qarshi","Termiz",null],["N","80","y","Qarshi","Toshkent",null],["N","80","y","Qarshi","Samarqand",null],
  ["N","82","y","Toshkent","Qarshi",null],
  ["N","125","y","Andijon","Xiva",null],["N","125","y","Andijon","Toshkent",null],["N","125","y","Andijon","Samarqand",null],["N","125","y","Andijon","Buxoro",null],
  ["N","125","y","Qo'qon","Toshkent",null],["N","125","y","Qo'qon","Buxoro",null],["N","125","y","Qo'qon","Xiva",null],
  ["N","125","y","Samarqand","Buxoro",null],["N","125","y","Samarqand","Xiva",null],
  ["N","125","y","Buxoro","Xiva",null],["N","125","y","Buxoro","Urganch",null],
  ["N","126","y","Xiva","Andijon",null],["N","126","y","Xiva","Toshkent",null],["N","126","y","Xiva","Samarqand",null],
  ["N","126","y","Xiva","Buxoro",null],["N","126","y","Xiva","Qo'qon",null],
  ["N","126","y","Urganch","Buxoro",null],["N","126","y","Urganch","Toshkent",null],
  ["N","126","y","Toshkent","Andijon",null],["N","126","y","Toshkent","Qo'qon",null],
  ["N","126","y","Samarqand","Andijon",null],
]

const HUBS_ORDER = [
  { n:'Toshkent', d:['Samarqand','Buxoro','Xiva','Urganch','Nukus','Navoiy','Andijon','Qarshi','Jizzax','Termiz','Guliston',"Qo'qon",'Margilon','Pop','Namangan'] },
  { n:'Guliston', d:[] }, { n:'Jizzax', d:[] }, { n:'Angren', d:[] },
  { n:'Andijon', d:['Toshkent','Samarqand','Buxoro','Xiva','Urganch','Navoiy','Qarshi','Jizzax','Termiz','Guliston',"Qo'qon",'Margilon','Pop','Namangan'] },
  { n:'Namangan', d:[] }, { n:'Margilon', d:[] }, { n:"Qo'qon", d:[] }, { n:'Pop', d:[] },
  { n:'Samarqand', d:['Toshkent','Buxoro','Urganch','Nukus','Navoiy','Andijon','Qarshi','Jizzax','Termiz','Guliston',"Qo'qon",'Margilon','Pop','Namangan','Xiva'] },
  { n:'Buxoro', d:['Toshkent','Samarqand','Urganch','Nukus','Navoiy','Andijon','Qarshi','Jizzax','Termiz','Guliston',"Qo'qon",'Margilon','Xiva'] },
  { n:'Navoiy', d:['Toshkent','Samarqand','Buxoro','Urganch','Nukus'] },
  { n:'Qarshi', d:['Toshkent','Samarqand','Termiz'] },
  { n:'Nukus', d:['Toshkent','Samarqand','Buxoro','Navoiy'] },
  { n:'Urganch', d:['Toshkent','Samarqand','Buxoro'] },
  { n:'Xiva', d:['Toshkent','Samarqand','Buxoro','Andijon',"Qo'qon",'Urganch'] },
]

function cnt(from, to, dayIdx) {
  let t=0,a=0,s=0,y=0
  for (const [,,tp,f,tt,days] of S) {
    if (f===from && tt===to && (days===null || days.includes(dayIdx))) {
      t++
      if (tp==='a') a++; else if (tp==='s') s++; else y++
    }
  }
  return {total:t,afrosiyob:a,sharq:s,tezkor:0,yolovchi:y}
}

function getNext7Days() {
  const days = [], now = new Date()
  const uzDays = ['Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba','Yakshanba']
  for (let i = 0; i < 7; i++) {
    const d = new Date(now); d.setDate(d.getDate()+i)
    const dow = (d.getDay()+6)%7
    days.push({
      date: d.toISOString().split('T')[0],
      dayOfWeek: dow,
      labelEn: d.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'}),
      labelUz: `${uzDays[dow]}, ${d.getDate()}-${d.toLocaleDateString('uz',{month:'short'})}`,
    })
  }
  return days
}

function buildData() {
  const days = getNext7Days()
  let idx = 0
  const hubGroups = []
  const seen = new Set()

  for (const hub of HUBS_ORDER) {
    if (seen.has(hub.n)) continue; seen.add(hub.n); idx++
    const routes = hub.d.map(dest => {
      const perDay = days.map(d => cnt(hub.n, dest, d.dayOfWeek))
      const weekly = {total:0,afrosiyob:0,sharq:0,tezkor:0,yolovchi:0}
      perDay.forEach(p => { weekly.total+=p.total; weekly.afrosiyob+=p.afrosiyob; weekly.sharq+=p.sharq; weekly.yolovchi+=p.yolovchi })
      return { from:hub.n, to:dest, routeName:`${hub.n}-${dest}`, weekly, perDay }
    })
    const hw = {total:0,afrosiyob:0,sharq:0,tezkor:0,yolovchi:0}
    routes.forEach(r => { hw.total+=r.weekly.total; hw.afrosiyob+=r.weekly.afrosiyob; hw.sharq+=r.weekly.sharq; hw.yolovchi+=r.weekly.yolovchi })
    hubGroups.push({ index:idx, hub:hub.n, hubWeekly:hw, routes })
  }
  return { days, hubGroups }
}

export const maxDuration = 60

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const fmt = searchParams.get('format')
  const data = buildData()

  if (fmt === 'csv') {
    let csv = `T/p,Vokzallar,Yo'nalish nomi,Haftalik jami,shundan Afrosiyob`
    for (const d of data.days) csv += `,${d.labelEn} - Jami,${d.labelEn} - Afrosiyob`
    csv += '\n'
    for (const hub of data.hubGroups) {
      if (hub.routes.length === 0) {
        csv += `${hub.index},${hub.hub},,${hub.hubWeekly.total},${hub.hubWeekly.afrosiyob}`
        for (let i=0;i<data.days.length;i++) csv += ',,'
        csv += '\n'
      } else {
        const mid = Math.floor(hub.routes.length/2)
        hub.routes.forEach((r,i) => {
          csv += `${i===mid?hub.index:''},${i===mid?hub.hub:''},${r.routeName},${r.weekly.total},${r.weekly.afrosiyob}`
          r.perDay.forEach(p => { csv += `,${p.total},${p.afrosiyob}` })
          csv += '\n'
        })
      }
    }
    return new Response(csv, { headers: { 'Content-Type':'text/csv;charset=utf-8', 'Content-Disposition':`attachment;filename="rail-intel-${new Date().toISOString().split('T')[0]}.csv"` } })
  }

  const flatRoutes = []
  for (const hub of data.hubGroups)
    for (const r of hub.routes)
      flatRoutes.push({ from:r.from, to:r.to, ...r.weekly, perDay:r.perDay })

  return Response.json({ days:data.days, hubGroups:data.hubGroups, routes:flatRoutes, fetchedAt:new Date().toISOString() })
}
