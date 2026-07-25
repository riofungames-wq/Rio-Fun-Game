// ============================================
// RIO MAGGI POINT
// SHARED LOYALTY ENGINE
// VERSION 1
// PART 1
// ============================================

// ============================================
// SETTINGS
// ============================================

export const LOYALTY_SETTINGS = {

MAX_STAMPS:6,

CARD_VALIDITY_DAYS:40,

REWARD_NAME:"ONE FREE VEG MAGGI",

STORE_NAME:"RIO MAGGI POINT"

};

// ============================================
// CARD EXPIRY DATE
// ============================================

export function getExpiryDate(startDate){

const start=new Date(startDate);

const expiry=new Date(start);

expiry.setDate(

expiry.getDate()+

LOYALTY_SETTINGS.CARD_VALIDITY_DAYS

);

return expiry;

}

// ============================================
// DAYS LEFT
// ============================================

export function getRemainingTime(startDate){

const expiry=

getExpiryDate(startDate);

const now=new Date();

const diff=

expiry-now;

if(diff<=0){

return{

expired:true,

days:0,

hours:0,

minutes:0,

seconds:0

};

}

return{

expired:false,

days:

Math.floor(diff/(1000*60*60*24)),

hours:

Math.floor((diff/(1000*60*60))%24),

minutes:

Math.floor((diff/(1000*60))%60),

seconds:

Math.floor((diff/1000)%60)

};

}

// ============================================
// STAMP PROGRESS
// ============================================

export function getStampProgress(total){

const current=

Math.min(

Number(total||0),

LOYALTY_SETTINGS.MAX_STAMPS

);

return{

current,

remaining:

LOYALTY_SETTINGS.MAX_STAMPS-current,

completed:

current>=LOYALTY_SETTINGS.MAX_STAMPS

};

}
// ============================================
// PART 2
// MEMBER LEVEL + HAPPY EMOJI + REWARD
// ============================================

// ============================================
// MEMBER LEVEL
// ============================================

export function getMemberLevel(stamps){

const total=Number(stamps||0);

if(total>=6){

return{

level:"Elite Member",

badge:"👑 ELITE MEMBER",

color:"#FFD700"

};

}

if(total>=3){

return{

level:"Gold Member",

badge:"🥇 GOLD MEMBER",

color:"#FFC107"

};

}

return{

level:"Silver Member",

badge:"⭐ SILVER MEMBER",

color:"#C0C0C0"

};

}

// ============================================
// HAPPY EMOJI
// ============================================

export function getHappyEmoji(stamps){

const faces=[

"🙂",

"😊",

"😄",

"😁",

"🤩",

"🥳",

"🎉"

];

const total=Math.min(

Number(stamps||0),

6

);

return faces[total];

}

// ============================================
// REWARD STATUS
// ============================================

export function getRewardStatus(stamps){

const total=Number(stamps||0);

if(total>=6){

return{

unlocked:true,

title:"🎉 Congratulations!",

message:"ONE FREE VEG MAGGI Unlocked 🍜"

};

}

return{

unlocked:false,

title:"Keep Collecting",

message:

(6-total)+

" Stamp"+

((6-total)>1?"s":"")+

" Remaining"

};

}

// ============================================
// STAMP DATE
// ============================================

export function getStampDate(date){

if(!date) return "--";

const d=new Date(date);

return d.toLocaleDateString(

"en-IN",

{

day:"2-digit",

month:"short"

}

);

}
// ============================================
// PART 3
// COUNTDOWN + AUTO RESET CHECK
// ============================================

// ============================================
// COUNTDOWN DATA
// ============================================

export function getCountdown(startDate){

const time=
getRemainingTime(startDate);

return{

days:String(time.days).padStart(2,"0"),

hours:String(time.hours).padStart(2,"0"),

minutes:String(time.minutes).padStart(2,"0"),

seconds:String(time.seconds).padStart(2,"0"),

expired:time.expired

};

}

// ============================================
// EXPIRY WARNING
// ============================================

export function getExpiryWarning(startDate){

const time=
getRemainingTime(startDate);

if(time.expired){

return{

text:"❌ YOUR CARD HAS EXPIRED",

color:"#D32F2F"

};

}

if(time.days<=5){

return{

text:
"⚠ Hurry! Only "+
time.days+
" Day"+
(time.days===1?"":"s")+
" Left",

color:"#F57C00"

};

}

return{

text:
"Complete All 6 Stamps Before Card Expires",

color:"#2E7D32"

};

}

// ============================================
// AUTO RESET CHECK
// ============================================

export function shouldResetCard(startDate){

const time=
getRemainingTime(startDate);

return time.expired;

}

// ============================================
// NEW CARD START DATE
// ============================================

export function createNewCardDate(){

return new Date().toISOString();

}
// ============================================
// PART 4
// FINAL UTILITIES
// VERSION 1
// ============================================

// ============================================
// REWARD ANIMATION LEVEL
// ============================================

export function getRewardAnimation(stamps){

const total = Number(stamps || 0);

return{

enabled: total >= 6,

emojiLevel: Math.min(total,6),

speed: total >= 6 ? 600 : 1200

};

}

// ============================================
// HAPPY EMOJI ANIMATION
// ============================================

export function getHappyAnimation(stamps){

const total = Number(stamps || 0);

if(total>=6){

return{

emoji:"🥳",

animation:"celebrate"

};

}

if(total>=5){

return{

emoji:"🤩",

animation:"bounce"

};

}

if(total>=4){

return{

emoji:"😁",

animation:"pulse"

};

}

if(total>=3){

return{

emoji:"😄",

animation:"smile"

};

}

if(total>=2){

return{

emoji:"😊",

animation:"soft"

};

}

return{

emoji:"🙂",

animation:"idle"

};

}

// ============================================
// HOME SUMMARY
// ============================================

export function getHomeSummary(stamps){

const progress =

getStampProgress(stamps);

const reward =

getRewardStatus(stamps);

const member =

getMemberLevel(stamps);

return{

stamps:progress.current,

remaining:progress.remaining,

completed:progress.completed,

reward,

member

};

}

// ============================================
// DEFAULT CUSTOMER
// ============================================

export function createDefaultCustomer(){

return{

stamps:0,

stampDates:[],

cardStartDate:createNewCardDate(),

rewardClaimed:false

};

}

// ============================================
// VERSION
// ============================================

export const LOYALTY_ENGINE_VERSION =

"1.0.0";

// ============================================
// READY
// ============================================

console.log(

"RIO Loyalty Engine V1 Loaded"

);

