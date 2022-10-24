const login= async(email, password)=>{
    try{
        const res= await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            },

        });
        window.setTimeout(()=>{
            location.assign('/')
        }, 500)

        console.log(res)

    }catch(err){
        console.log(err.response.data)
    }
};
const signupFb= async()=>{
    try{
        const res= await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/signup-facebook'
        })
        console.log(res)

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

