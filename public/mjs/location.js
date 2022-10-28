const findState = () => {
    const status = document.querySelector('.fh5co-wrapper');
  
    const success = (position) => {
      console.log(position);
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
  
      const geoApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
      fetch(geoApiUrl)
        .then((res) => res.json())
        .then((data) => {
          console.log(data.latitude, data.longitude);
          const lat = data.latitude;
          const long = data.longitude;
          const unit = 'mi';
          const distance = 30;
          location.assign(`about/${distance}/${lat},${long}/unit/${unit}`);
          return { latitude: lat, longitude: long };
        });
    };
  
    const error = () => {
      alert('Unable to retrieve your location');
    };
  
    navigator.geolocation.getCurrentPosition(success, error);
  };
  
  window.addEventListener('load', () => {
    findState();
  });
  