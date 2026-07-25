// ===============================
// PHOTO / AVATAR
// ===============================

if(data.photoURL){

customerPhoto.src =
data.photoURL;

customerPhoto.style.display =
"block";

defaultAvatar.style.display =
"none";

}

else{

customerPhoto.style.display =
"none";

defaultAvatar.style.display =
"block";

let avatarPath="";

if(data.gender==="female"){

avatarPath=
"assets/avatars/female/"+data.avatar;

}
else{

avatarPath=
"assets/avatars/male/"+data.avatar;

}

defaultAvatar.innerHTML=

`
<img
src="${avatarPath}"
class="avatar-image">
`;

}
