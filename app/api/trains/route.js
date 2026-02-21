// app/api/trains/route.js
// Verified schedule from seat61.com (Jan 2026) + eticket.railway.uz
// Each: [trainNum, type, from, to, days]  null=daily, array=0Mon..6Sun

const D = null // daily
const T = [
  // =============================================
  // TASHKENT → SAMARKAND / BUXORO / XIVA direction
  // =============================================
  // 778 Afrosiyob Sat,Sun - Tashkent→Samarkand
  ['778','A','Toshkent','Samarqand',[5,6]],
  // 764 Afrosiyob daily - Tashkent→Samarkand→Qarshi
  ['764','A','Toshkent','Samarqand',D],['764','A','Toshkent','Qarshi',D],['764','A','Samarqand','Qarshi',D],
  // 766 Afrosiyob daily - Tashkent→Samarkand→(Navoiy→Buxoro per eticket.railway.uz)
  ['766','A','Toshkent','Samarqand',D],['766','A','Toshkent','Navoiy',D],['766','A','Toshkent','Buxoro',D],
  ['766','A','Samarqand','Navoiy',D],['766','A','Samarqand','Buxoro',D],['766','A','Navoiy','Buxoro',D],
  // 768 Afrosiyob daily - Tashkent→Samarkand (verified: does NOT continue to Buxoro)
  ['768','A','Toshkent','Samarqand',D],
  // 770 Afrosiyob daily - Tashkent→Samarkand→Navoiy→Buxoro
  ['770','A','Toshkent','Samarqand',D],['770','A','Toshkent','Navoiy',D],['770','A','Toshkent','Buxoro',D],
  ['770','A','Samarqand','Navoiy',D],['770','A','Samarqand','Buxoro',D],['770','A','Navoiy','Buxoro',D],
  // 710 Sharq daily - Tashkent→Samarkand→Navoiy→Buxoro
  ['710','S','Toshkent','Samarqand',D],['710','S','Toshkent','Navoiy',D],['710','S','Toshkent','Buxoro',D],
  ['710','S','Samarqand','Navoiy',D],['710','S','Samarqand','Buxoro',D],['710','S','Navoiy','Buxoro',D],
  // 054 Night daily - Tashkent→Samarkand→Buxoro→(Nukus branch)
  ['054','Y','Toshkent','Samarqand',D],['054','Y','Toshkent','Buxoro',D],['054','Y','Toshkent','Navoiy',D],['054','Y','Toshkent','Nukus',D],
  ['054','Y','Samarqand','Buxoro',D],['054','Y','Samarqand','Nukus',D],['054','Y','Buxoro','Nukus',D],['054','Y','Navoiy','Nukus',D],
  // 772 Afrosiyob daily - Tashkent→Samarkand→Navoiy→Buxoro (evening)
  ['772','A','Toshkent','Samarqand',D],['772','A','Toshkent','Navoiy',D],['772','A','Toshkent','Buxoro',D],
  ['772','A','Samarqand','Navoiy',D],['772','A','Samarqand','Buxoro',D],['772','A','Navoiy','Buxoro',D],
  // 712 Sharq daily - Tashkent→Samarkand→Navoiy→Buxoro (evening)
  ['712','S','Toshkent','Samarqand',D],['712','S','Toshkent','Navoiy',D],['712','S','Toshkent','Buxoro',D],
  ['712','S','Samarqand','Navoiy',D],['712','S','Samarqand','Buxoro',D],['712','S','Navoiy','Buxoro',D],
  // 056 Night Tue,Wed,Fri,Sat - Tashkent→Samarkand→Buxoro→Urganch→Xiva
  ['056','Y','Toshkent','Samarqand',[1,2,4,5]],['056','Y','Toshkent','Buxoro',[1,2,4,5]],['056','Y','Toshkent','Navoiy',[1,2,4,5]],
  ['056','Y','Toshkent','Urganch',[1,2,4,5]],['056','Y','Toshkent','Xiva',[1,2,4,5]],
  ['056','Y','Samarqand','Buxoro',[1,2,4,5]],['056','Y','Samarqand','Urganch',[1,2,4,5]],
  ['056','Y','Buxoro','Urganch',[1,2,4,5]],['056','Y','Buxoro','Xiva',[1,2,4,5]],['056','Y','Urganch','Xiva',[1,2,4,5]],
  // 058 Night Mon,Thu,Sun - Tashkent→Samarkand→Buxoro→Urganch
  ['058','Y','Toshkent','Samarqand',[0,3,6]],['058','Y','Toshkent','Buxoro',[0,3,6]],['058','Y','Toshkent','Navoiy',[0,3,6]],
  ['058','Y','Toshkent','Urganch',[0,3,6]],
  ['058','Y','Samarqand','Buxoro',[0,3,6]],['058','Y','Samarqand','Urganch',[0,3,6]],
  ['058','Y','Buxoro','Urganch',[0,3,6]],
  // 125 Night Mon,Tue,Fri,Sat - via Fergana valley→Samarkand→Buxoro→Urganch→Xiva
  ['125','Y','Toshkent','Samarqand',[0,1,4,5]],['125','Y','Toshkent','Buxoro',[0,1,4,5]],
  ['125','Y','Toshkent','Urganch',[0,1,4,5]],['125','Y','Toshkent','Xiva',[0,1,4,5]],
  ['125','Y','Samarqand','Buxoro',[0,1,4,5]],['125','Y','Samarqand','Xiva',[0,1,4,5]],
  ['125','Y','Buxoro','Urganch',[0,1,4,5]],['125','Y','Buxoro','Xiva',[0,1,4,5]],
  // 072 Night daily (verified eticket.railway.uz) - Tashkent→Samarkand→Buxoro
  ['072','Y','Toshkent','Samarqand',D],['072','Y','Toshkent','Buxoro',D],['072','Y','Toshkent','Navoiy',D],
  ['072','Y','Samarqand','Buxoro',D],

  // =============================================
  // RETURN: BUXORO / SAMARKAND → TASHKENT direction
  // =============================================
  // 771 Afrosiyob daily - Buxoro→Navoiy→Samarkand→Tashkent
  ['771','A','Buxoro','Navoiy',D],['771','A','Buxoro','Samarqand',D],['771','A','Buxoro','Toshkent',D],
  ['771','A','Navoiy','Samarqand',D],['771','A','Navoiy','Toshkent',D],['771','A','Samarqand','Toshkent',D],
  // 711 Sharq daily
  ['711','S','Buxoro','Navoiy',D],['711','S','Buxoro','Samarqand',D],['711','S','Buxoro','Toshkent',D],
  ['711','S','Navoiy','Samarqand',D],['711','S','Navoiy','Toshkent',D],['711','S','Samarqand','Toshkent',D],
  // 769 Afrosiyob daily
  ['769','A','Buxoro','Navoiy',D],['769','A','Buxoro','Samarqand',D],['769','A','Buxoro','Toshkent',D],
  ['769','A','Navoiy','Samarqand',D],['769','A','Navoiy','Toshkent',D],['769','A','Samarqand','Toshkent',D],
  // 765 Afrosiyob daily - Samarkand→Tashkent (no Buxoro stop going east)
  ['765','A','Samarqand','Toshkent',D],
  // 767 Afrosiyob daily - Buxoro→Samarkand→Tashkent
  ['767','A','Buxoro','Navoiy',D],['767','A','Buxoro','Samarqand',D],['767','A','Buxoro','Toshkent',D],
  ['767','A','Navoiy','Samarqand',D],['767','A','Navoiy','Toshkent',D],['767','A','Samarqand','Toshkent',D],
  // 763 Afrosiyob daily - Qarshi→Samarkand→Tashkent
  ['763','A','Qarshi','Samarqand',D],['763','A','Qarshi','Toshkent',D],['763','A','Samarqand','Toshkent',D],
  // 709 Sharq daily
  ['709','S','Buxoro','Navoiy',D],['709','S','Buxoro','Samarqand',D],['709','S','Buxoro','Toshkent',D],
  ['709','S','Navoiy','Samarqand',D],['709','S','Navoiy','Toshkent',D],['709','S','Samarqand','Toshkent',D],
  // 054 Night return (except Tue)
  ['054','Y','Nukus','Buxoro',[0,2,3,4,5,6]],['054','Y','Nukus','Samarqand',[0,2,3,4,5,6]],['054','Y','Nukus','Toshkent',[0,2,3,4,5,6]],['054','Y','Nukus','Navoiy',[0,2,3,4,5,6]],
  ['054','Y','Buxoro','Samarqand',[0,2,3,4,5,6]],['054','Y','Buxoro','Toshkent',[0,2,3,4,5,6]],
  ['054','Y','Samarqand','Toshkent',[0,2,3,4,5,6]],['054','Y','Navoiy','Toshkent',[0,2,3,4,5,6]],
  // 056 Night return Wed,Thu,Sat,Sun
  ['056','Y','Xiva','Urganch',[2,3,5,6]],['056','Y','Xiva','Buxoro',[2,3,5,6]],['056','Y','Xiva','Samarqand',[2,3,5,6]],['056','Y','Xiva','Toshkent',[2,3,5,6]],
  ['056','Y','Urganch','Buxoro',[2,3,5,6]],['056','Y','Urganch','Samarqand',[2,3,5,6]],['056','Y','Urganch','Toshkent',[2,3,5,6]],
  ['056','Y','Buxoro','Samarqand',[2,3,5,6]],['056','Y','Buxoro','Toshkent',[2,3,5,6]],
  ['056','Y','Samarqand','Toshkent',[2,3,5,6]],
  // 058 Night return Mon,Tue,Fri
  ['058','Y','Urganch','Buxoro',[0,1,4]],['058','Y','Urganch','Samarqand',[0,1,4]],['058','Y','Urganch','Toshkent',[0,1,4]],
  ['058','Y','Buxoro','Samarqand',[0,1,4]],['058','Y','Buxoro','Toshkent',[0,1,4]],
  ['058','Y','Samarqand','Toshkent',[0,1,4]],
  // 126 Night return Tue,Wed,Sat,Sun
  ['126','Y','Xiva','Urganch',[1,2,5,6]],['126','Y','Xiva','Buxoro',[1,2,5,6]],['126','Y','Xiva','Samarqand',[1,2,5,6]],['126','Y','Xiva','Toshkent',[1,2,5,6]],
  ['126','Y','Urganch','Buxoro',[1,2,5,6]],['126','Y','Urganch','Toshkent',[1,2,5,6]],
  ['126','Y','Buxoro','Samarqand',[1,2,5,6]],
  ['126','Y','Samarqand','Toshkent',[1,2,5,6]],

  // =============================================
  // TASHKENT ↔ FERGANA VALLEY (Andijon, Namangan, etc.)
  // =============================================
  // 730 Yo'lovchi daily Tashkent→Andijon
  ['730','Y','Toshkent','Andijon',D],['730','Y','Toshkent',"Qo'qon",D],['730','Y','Toshkent','Margilon',D],['730','Y','Toshkent','Namangan',D],
  // 729 Yo'lovchi daily Andijon→Tashkent
  ['729','Y','Andijon','Toshkent',D],['729','Y',"Qo'qon",'Toshkent',D],['729','Y','Margilon','Toshkent',D],['729','Y','Namangan','Toshkent',D],

  // =============================================
  // TASHKENT ↔ TERMIZ
  // =============================================
  // 080 Yo'lovchi daily Termiz→Qarshi→Samarkand→Tashkent
  ['080','Y','Termiz','Toshkent',D],['080','Y','Termiz','Samarqand',D],['080','Y','Termiz','Qarshi',D],
  ['080','Y','Qarshi','Toshkent',D],['080','Y','Qarshi','Samarqand',D],['080','Y','Samarqand','Toshkent',D],
  // 082 Yo'lovchi Qarshi→Tashkent (via Sariosiyo→Tashkent janubiy)
  ['082','Y','Qarshi','Toshkent',D],['082','Y','Qarshi','Samarqand',D],
  // 703 Nasaf daily Qarshi→Tashkent
  ['703','N','Qarshi','Toshkent',D],
  // 130 Passenger Termiz→Andijon direction
  ['130','Y','Termiz','Toshkent',D],['130','Y','Termiz','Qarshi',D],['130','Y','Qarshi','Toshkent',D],

  // =============================================
  // TASHKENT ↔ JIZZAX / GULISTON
  // =============================================
  // Jizzax and Guliston are intermediate stops on Tashkent-Samarkand trains
  // Not separately counted (passengers use Afrosiyob/Sharq stopping there)

  // =============================================
  // ANDIJON region internal
  // =============================================
  ['729','Y','Andijon',"Qo'qon",D],['729','Y','Andijon','Margilon',D],['729','Y','Andijon','Namangan',D],
  ['730','Y',"Qo'qon",'Andijon',D],['730','Y','Margilon','Andijon',D],['730','Y','Namangan','Andijon',D],
]

// Hubs and destinations (Excel order)
const HUBS = [
  {n:'Toshkent',d:['Samarqand','Buxoro','Xiva','Urganch','Nukus','Navoiy','Andijon','Qarshi','Jizzax','Termiz','Guliston',"Qo'qon",'Margilon','Pop','Namangan']},
  {n:'Guliston',d:[]},{n:'Jizzax',d:[]},{n:'Angren',d:[]},
  {n:'Andijon',d:['Toshkent','Samarqand','Buxoro','Xiva','Urganch','Navoiy','Qarshi','Jizzax','Termiz','Guliston',"Qo'qon",'Margilon','Pop','Namangan']},
  {n:'Namangan',d:['Toshkent','Andijon']},{n:'Margilon',d:['Toshkent','Andijon']},{n:"Qo'qon",d:['Toshkent','Andijon']},{n:'Pop',d:[]},
  {n:'Samarqand',d:['Toshkent','Buxoro','Urganch','Nukus','Navoiy','Andijon','Qarshi','Jizzax','Termiz','Guliston',"Qo'qon",'Margilon','Pop','Namangan','Xiva']},
  {n:'Buxoro',d:['Toshkent','Samarqand','Urganch','Nukus','Navoiy','Andijon','Qarshi','Jizzax','Termiz','Guliston',"Qo'qon",'Margilon','Xiva']},
  {n:'Navoiy',d:['Toshkent','Samarqand','Buxoro','Urganch','Nukus']},
  {n:'Qarshi',d:['Toshkent','Samarqand','Termiz']},
  {n:'Nukus',d:['Toshkent','Samarqand','Buxoro','Navoiy']},
  {n:'Urganch',d:['Toshkent','Samarqand','Buxoro']},
  {n:'Xiva',d:['Toshkent','Samarqand','Buxoro','Andijon',"Qo'qon",'Urganch']},
]

function cnt(from,to,dow) {
  let tot=0,a=0,s=0,n=0,y=0
  const seen = new Set()
  for (const [num,tp,f,t,days] of T) {
    if (f===from && t===to && (days===null||days.includes(dow))) {
      // Deduplicate: same train number on same route counts once
      const k = `${num}-${f}-${t}`
      if (seen.has(k)) continue
      seen.add(k)
      tot++
      if (tp==='A') a++; else if (tp==='S') s++; else if (tp==='N') n++; else y++
    }
  }
  return {total:tot,afrosiyob:a,sharq:s,tezkor:n,yolovchi:y}
}

function get7Days() {
  const days=[],uz=['Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba','Yakshanba'],now=new Date()
  for(let i=0;i<7;i++){
    const d=new Date(now);d.setDate(d.getDate()+i)
    const dow=(d.getDay()+6)%7
    const [y,m,dd]=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')]
    days.push({date:`${y}-${m}-${dd}`,dayOfWeek:dow,labelEn:d.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'}),labelUz:`${uz[dow]}, ${d.getDate()}-fev`})
  }
  return days
}

function buildData(){
  const days=get7Days()
  let idx=0;const hubGroups=[],seen=new Set()
  for(const hub of HUBS){
    if(seen.has(hub.n))continue;seen.add(hub.n);idx++
    const routes=hub.d.map(dest=>{
      const perDay=days.map(d=>cnt(hub.n,dest,d.dayOfWeek))
      const w={total:0,afrosiyob:0,sharq:0,tezkor:0,yolovchi:0}
      perDay.forEach(p=>{w.total+=p.total;w.afrosiyob+=p.afrosiyob;w.sharq+=p.sharq;w.tezkor+=p.tezkor;w.yolovchi+=p.yolovchi})
      return{from:hub.n,to:dest,routeName:`${hub.n}-${dest}`,weekly:w,perDay}
    })
    const hw={total:0,afrosiyob:0,sharq:0,tezkor:0,yolovchi:0}
    routes.forEach(r=>{hw.total+=r.weekly.total;hw.afrosiyob+=r.weekly.afrosiyob;hw.sharq+=r.weekly.sharq;hw.tezkor+=r.weekly.tezkor;hw.yolovchi+=r.weekly.yolovchi})
    hubGroups.push({index:idx,hub:hub.n,hubWeekly:hw,routes})
  }
  return{days,hubGroups}
}

export async function GET(request){
  const{searchParams}=new URL(request.url)
  const fmt=searchParams.get('format')
  const data=buildData()

  if(fmt==='csv'){
    let csv=`T/p,Vokzallar,Yo'nalish nomi,Haftalik jami,shundan Afrosiyob`
    for(const d of data.days)csv+=`,${d.labelEn} - Jami,${d.labelEn} - Afrosiyob`
    csv+='\n'
    for(const hub of data.hubGroups){
      if(hub.routes.length===0){
        csv+=`${hub.index},${hub.hub},,${hub.hubWeekly.total},${hub.hubWeekly.afrosiyob}`
        for(let i=0;i<data.days.length;i++)csv+=',,'
        csv+='\n'
      }else{
        const mid=Math.floor(hub.routes.length/2)
        hub.routes.forEach((r,i)=>{
          csv+=`${i===mid?hub.index:''},${i===mid?hub.hub:''},${r.routeName},${r.weekly.total},${r.weekly.afrosiyob}`
          r.perDay.forEach(p=>{csv+=`,${p.total},${p.afrosiyob}`})
          csv+='\n'
        })
      }
    }
    return new Response(csv,{headers:{'Content-Type':'text/csv;charset=utf-8','Content-Disposition':`attachment;filename="rail-intel-${data.days[0]?.date}.csv"`}})
  }

  const flat=[]
  for(const hub of data.hubGroups)for(const r of hub.routes)flat.push({from:r.from,to:r.to,...r.weekly,perDay:r.perDay})
  return Response.json({days:data.days,hubGroups:data.hubGroups,routes:flat,fetchedAt:new Date().toISOString(),source:'seat61-verified-2026'})
}
