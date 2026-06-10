(function exposeStorageSafe(global){
  global.storageSafe = {
    getItem(key){
      try{
        return global.localStorage.getItem(key);
      }catch(error){
        try{return localStorage.getItem(key)}catch(fallbackError){return null}
      }
    },
    setItem(key,value){
      try{
        global.localStorage.setItem(key,value);
      }catch(error){
        try{localStorage.setItem(key,value)}catch(fallbackError){}
      }
    },
    removeItem(key){
      try{
        global.localStorage.removeItem(key);
      }catch(error){
        try{localStorage.removeItem(key)}catch(fallbackError){}
      }
    }
  };
})(window);
