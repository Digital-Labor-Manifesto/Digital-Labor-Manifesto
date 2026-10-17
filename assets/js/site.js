(()=>{"use strict";
const doc=document.documentElement,prose=document.querySelector(".manifesto-prose"),toc=document.getElementById("toc"),progress=document.getElementById("scroll-progress");
if(!prose)return;
const headings=[...prose.querySelectorAll("h1,h2,h3,h4")];
const slug=(text)=>text.toLowerCase().trim().replace(/[\u064b-\u065f]/g,"").replace(/[^\p{L}\p{N}\s-]/gu,"").replace(/\s+/g,"-");
const seen=new Map();
headings.forEach((h,i)=>{let id=h.id||slug(h.textContent)||"section-"+i;const count=seen.get(id)||0;seen.set(id,count+1);if(count)id+="-"+(count+1);h.id=id;const a=document.createElement("a");a.href="#"+encodeURIComponent(id);a.textContent=h.textContent.trim();a.className="toc-depth-"+h.tagName.slice(1);toc?.append(a)});
const mobile=document.getElementById("side-toggle");mobile?.addEventListener("click",()=>{const open=toc.classList.toggle("is-open");mobile.setAttribute("aria-expanded",String(open));mobile.querySelector("span").textContent=open?"إخفاء الفهرس":"عرض الفهرس"});
toc?.addEventListener("click",e=>{if(e.target.closest("a")&&innerWidth<=720){toc.classList.remove("is-open");mobile?.setAttribute("aria-expanded","false")}});
let pending=false;const onScroll=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{const h=document.documentElement;const denominator=h.scrollHeight-h.clientHeight;progress&&(progress.style.width=(denominator>0?Math.min(100,100*scrollY/denominator):0)+"%");pending=false})};window.addEventListener("scroll",onScroll,{passive:true});onScroll();

const releasePanel=document.getElementById("releases");
if(releasePanel){
  const versionOutput=document.getElementById("release-version");
  const dateOutput=document.getElementById("release-date");
  const reportLink=document.getElementById("release-report-link");
  const api=releasePanel.getAttribute("data-latest-release-api");
  const loadRelease=async()=>{
    try{
      const response=await fetch(api,{headers:{"Accept":"application/vnd.github+json"}});
      if(!response.ok)throw new Error("Could not fetch latest release");
      const release=await response.json();
      const version=typeof release.tag_name==="string"?release.tag_name.replace(/^v(?=\d)/i,""):"";
      if(!version||release.draft||release.prerelease)throw new Error("Invalid release data");
      const releaseUrl=new URL(release.html_url);
      const expectedPath="/Digital-Labor-Manifesto/Digital-Labor-Manifesto/releases/tag/";
      if(releaseUrl.origin!=="https://github.com"||!releaseUrl.pathname.startsWith(expectedPath))throw new Error("Invalid release URL");
      versionOutput.textContent=version;
      const published=release.published_at?new Date(release.published_at):null;
      if(published&&!Number.isNaN(published.valueOf())){
        dateOutput.textContent=new Intl.DateTimeFormat("ar-EG",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(published);
        dateOutput.setAttribute("datetime",published.toISOString());
      }else{
        dateOutput.textContent="إصدار منشور على GitHub";
      }
      reportLink.href=releaseUrl.href;
      reportLink.textContent="تقرير الإصدار "+version+" ↗";
    }catch(error){
      versionOutput.textContent="—";
      dateOutput.textContent="تعذّر تحميل بيانات الإصدار حاليًا";
      reportLink.textContent="عرض الإصدارات وتقاريرها ↗";
    }
  };
  void loadRelease();
}
})();
