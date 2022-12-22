const axios= require('axios')

const logout = async () => {
    try {
      const res = await axios({
        method: 'GET',
        url: '/api/v1/users/logout'
      });
      if ((res.data.status === 'success')){
        window.setTimeout(()=>{
          location.assign('/')
      }, 100)
      } 
    } catch (err) {
      alert(err, 'Error logging out! Try again.');
    }
  };

document.getElementById('logout').addEventListener('click', e=>{
    logout()
});