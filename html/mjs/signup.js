// import axios from '.../node_modules/axios';

const signup = async (firstName, lastName, email, password, confirmPassword)=>{
    try{
        const res= await axios({
            method: 'POST',
            url: '/api/v1/users',
            data:{
                firstName,
                lastName,
                email,
                password,
                confirmPassword
            }

        });
            window.setTimeout(()=>{
                location.assign('/')
            }, 500)

    }catch(err){
        console.log(err)

    };
  }

document.getElementById('sign-up').addEventListener('click', e=>{
    e.preventDefault();
    const name= document.getElementById('name').value.split(' ')
    const firstName= name[0]
    const lastName= name[1]
    const email= document.getElementById('email').value
    const password= document.getElementById('password').value
    const confirmPassword= document.getElementById('password-confirm').value

    signup(firstName, lastName, email, password, confirmPassword)

})