(function(global){
  'use strict';

  function escapeHTML(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function createRenderScheduler(){
    let renderScheduled=false;
    let scheduledRender=null;
    let lastRenderState=null;

    return {
      schedule(renderFn){
        if(renderScheduled)return;
        renderScheduled=true;
        scheduledRender=renderFn;
        requestAnimationFrame(()=>{
          if(scheduledRender)scheduledRender();
          renderScheduled=false;
          scheduledRender=null;
        });
      },
      shouldRender(state){
        const stateStr=JSON.stringify(state||{});
        if(lastRenderState===stateStr)return false;
        lastRenderState=stateStr;
        return true;
      }
    };
  }

  global.UIEngine={
    escapeHTML,
    createRenderScheduler
  };
})(window);
