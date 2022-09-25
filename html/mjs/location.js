const findState= ()=>{
    
    const status= document.querySelector('.fh5co-wrapper');

    const success= (position)=>{
        console.log(position)
        const latitude= position.coords.latitude;
        const longitude= position.coords.longitude;
        
        const geoApiUrl= `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        fetch(geoApiUrl)
        .then(res=> res.json())
        .then(data=>{
            console.log(data.latitude, data.longitude)
        })
        res.locals.location= {latitude: data.latitude, longitude: data.longitude}
    };
    const error=()=>{
        alert('Unable to retrieve your location')
    }
    navigator.geolocation.getCurrentPosition(success, error);

};



window.addEventListener('load',()=>{
findState
const user= res.locals.user
user.currentLocation= [data.latitude, data.longitude]
});







