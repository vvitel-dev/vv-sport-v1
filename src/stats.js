(function(global){
  'use strict';

  function getHistory(storageSafe){
    try{
      return JSON.parse(storageSafe.getItem('vv-history')||'[]');
    }catch(e){
      return [];
    }
  }

  function saveHistory(storageSafe,list){
    storageSafe.setItem('vv-history',JSON.stringify((list||[]).slice(-120)));
  }

  function summary(options){
    const list=options.history||[];
    const dateKey=options.dateKey;
    const isRestDateKey=options.isRestDateKey;
    const byDate={};
    let exercises=0, minutes=0;

    list.forEach(x=>{
      if((x.exercise||'').toLowerCase()==='repos')return;
      byDate[x.date]=(byDate[x.date]||0)+1;
      exercises++;
      minutes+=x.minutes||2;
    });

    const sessions=Object.keys(byDate).length;
    let streak=0;
    const d=new Date();
    for(let i=0;i<60;i++){
      const key=dateKey(d);
      if(byDate[key]){
        streak++;
        d.setDate(d.getDate()-1);
      }else if(isRestDateKey(key)){
        d.setDate(d.getDate()-1);
      }else{
        break;
      }
    }

    return {list,byDate,sessions,exercises,minutes,streak};
  }

  function weekSummary(options){
    const rows=options.days.map(day=>{
      const program=options.getProgram();
      const exercises=(program[day]&&program[day].exercises?program[day].exercises:[]).filter(ex=>ex.type!=='repos');
      const total=exercises.length;
      const done=exercises.filter(ex=>options.getDone(ex,day)).length;
      return {day,total,done,pct:total?Math.round(done/total*100):0,rest:!total};
    });
    const workoutDays=rows.filter(x=>!x.rest);
    const doneDays=workoutDays.filter(x=>x.total && x.done>=x.total).length;
    const totalExercises=workoutDays.reduce((sum,x)=>sum+x.total,0);
    const doneExercises=workoutDays.reduce((sum,x)=>sum+x.done,0);
    const restDays=rows.filter(x=>x.rest).length;
    return {
      rows,
      doneDays,
      workoutDays:workoutDays.length,
      restDays,
      totalExercises,
      doneExercises,
      pct:totalExercises?Math.round(doneExercises/totalExercises*100):0
    };
  }

  function formatHistoryDate(key,dateFromKey){
    const d=dateFromKey(key);
    try{
      return d.toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
    }catch(e){
      return key;
    }
  }

  function formatChartDay(date){
    try{
      return date.toLocaleDateString('fr-FR',{weekday:'short'}).replace('.','').slice(0,3);
    }catch(e){
      return '';
    }
  }

  function groupHistoryByDate(list,todayKey){
    const groups={};
    (list||[]).forEach(x=>{
      const k=x.date||todayKey();
      if(!groups[k])groups[k]=[];
      groups[k].push(x);
    });
    return Object.keys(groups).sort().reverse().map(date=>({
      date,
      items:groups[date].sort((a,b)=>(b.time||0)-(a.time||0)),
      minutes:groups[date].reduce((sum,x)=>sum+(x.minutes||2),0)
    }));
  }

  global.StatsEngine={
    getHistory,
    saveHistory,
    summary,
    weekSummary,
    formatHistoryDate,
    formatChartDay,
    groupHistoryByDate
  };
})(window);
