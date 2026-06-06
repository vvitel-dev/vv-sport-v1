function hideIconGlyphsFromAssistiveTech(root = document){
  root.querySelectorAll('.mini-timer-btn, .check-btn').forEach(button=>{
    if(button.querySelector('[aria-hidden="true"]'))return;
    const label=button.getAttribute('aria-label')||button.getAttribute('title');
    const glyph=button.textContent.trim();
    if(!glyph)return;
    button.textContent='';
    button.innerHTML='<span aria-hidden="true">'+glyph+'</span>';
    if(label)button.setAttribute('aria-label',label);
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  hideIconGlyphsFromAssistiveTech();
  new MutationObserver(mutations=>{
    for(const mutation of mutations){
      mutation.addedNodes.forEach(node=>{
        if(node.nodeType===1)hideIconGlyphsFromAssistiveTech(node);
      });
    }
  }).observe(document.body,{childList:true,subtree:true});
});
