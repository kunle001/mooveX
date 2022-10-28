const axios= require('axios')

const login= async(email, password)=>{
    try{
        const res= await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            },

        });
        window.setTimeout(()=>{
            location.assign('/')
        }, 500)

    }catch(err){
        console.log(err)
        alert({
            error: err.response
        })
    }
};

const signupFb= async()=>{
    try{
        const res= await axios({
            method: 'GET',
            url: `/api/v1/users/signup-facebook`
        })

    }catch(err){
        console.log(err)
    }

}


document.querySelector('.login-form').addEventListener('submit', e=>{
    e.preventDefault();
    const email= document.getElementById('email').value
    const password= document.getElementById('password').value
    login(email, password)
})
 
document.getElementById('facebook').addEventListener('click', e=>{
    e.preventDefault();
    signupFb
})

