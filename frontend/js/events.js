const events = [

{
title:"monthly awrds",
category:"Performance Review",
type:"review",
date:"Thursday, 21 May 2026",
description:"all should attend",
days:"🎉 Today!",
line:"#7c3aed",
badgeBg:"#fff0dc",
badgeColor:"#ff7a00"
},

{
title:"Town hall",
category:"Company Event",
type:"event",
date:"Saturday, 23 May 2026",
description:"",
days:"In 2 days",
line:"#0891b2",
badgeBg:"#dffcf3",
badgeColor:"#0f9f74"
}

];

const todayDate =
document.getElementById(
"todayDate"
);

todayDate.innerText =
new Date().toLocaleDateString(
"en-GB",
{
weekday:"long",
day:"numeric",
month:"long",
year:"numeric"
}
);

function loadEvents(type="all",btn=null){

const container =
document.getElementById(
"eventsContainer"
);

let filteredEvents;

if(type==="all"){

filteredEvents = events;

}else{

filteredEvents =
events.filter(
(event)=>event.type===type
);

}

document.getElementById(
"eventCount"
).innerText =
filteredEvents.length;

document.getElementById(
"topCount"
).innerText =
filteredEvents.length;

container.innerHTML="";

filteredEvents.forEach((item)=>{

container.innerHTML += `

<div class="event-card">

<div class="left-section">

<div class="color-line"
style="
background:${item.line}
">
</div>

<div class="event-details">

<h3>

${item.title}

<span class="badge"
style="
background:${item.badgeBg};
color:${item.badgeColor};
">

${item.category}

</span>

</h3>

<div class="event-date">

${item.date}

</div>

<div class="event-description">

${item.description}

</div>

</div>

</div>

<div class="day-box">

${item.days}

</div>

</div>

`;

});

document
.querySelectorAll(".tab")
.forEach((tab)=>{

tab.classList.remove(
"active-tab"
);

});

if(btn){

btn.classList.add(
"active-tab"
);

}

}

loadEvents();