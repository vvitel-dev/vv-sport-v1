(function(global){
  'use strict';

  function clone(value){
    return JSON.parse(JSON.stringify(value));
  }

  function days(program){
    return Object.keys(program||{});
  }

  function getRealDay(date=new Date()){
    const map=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    return map[date.getDay()] || 'Lundi';
  }

  function dayForDate(date,programDays){
    const list=programDays&&programDays.length?programDays:['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
    return list[(date.getDay()+6)%7] || 'Lundi';
  }

  function isRestProgramDay(dayName,program){
    const day=program&&program[dayName];
    return dayName==='Dimanche' || !!(day && day.exercises && day.exercises.length && day.exercises.every(ex=>ex.type==='repos'));
  }

  global.ProgramEngine={
    clone,
    days,
    getRealDay,
    dayForDate,
    isRestProgramDay
  };
})(window);
