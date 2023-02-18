const findState =  () => {
  const success = async(position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const geoApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const response = await fetch(geoApiUrl);
    const data = await response.json();

    const lat = data.latitude;
    const long = data.longitude;
    const unit = 'mi';
    const distance = 30;
    setTimeout(() => {
      location.assign(`about/${distance}/center/${lat},${long}/unit/${unit}`);
    }, 1000);
  };

  const error = (error) => {
    console.error(error);
    alert('Unable to retrieve your location');
  };

  navigator.geolocation.getCurrentPosition(success, error);
};

window.addEventListener('load', () => {
  findState();
});
