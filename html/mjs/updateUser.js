const updateMe= async(type, data)=>{
    try{
        await axios({
            url:  type==='password'? '/api/v1/users/update-password'
                : '/api/v1/users/my-profile',
            method: 'PATCH',
            data
        });

        alert('Data updated successfully')

            window.setTimeout(()=>{
                location.assign('/my-profile')
            }, 500)
    }catch(err){
        console.log(err)

    }
};


document.querySelector('.update-user-form').addEventListener('submit', e=>{
    e.preventDefault()


    const fullname = document.getElementById('new-full-name').value
    const email= document.getElementById('new-email').value
    const bio= document.getElementById('aboutMe').value
    const imageCover= document.getElementById('imageCover').files[0]
    const firstName= fullname.split(' ')[0]
    const lastName= fullname.split(' ')[1]

    const form= new FormData()
    form.append('firstName', firstName)
    form.append('lastName', lastName)
    form.append('email', email)
    form.append('bio', bio)
    form.append('imageCover', imageCover )

    updateMe('data', form)

    });

document.querySelector('.update-password').addEventListener('submit', e=>{
    e.preventDefault();
    const oldPassword= document.getElementById('oldPassword').value;
    const newPassword= document.getElementById('newPassword').value;
    const confirmPassword= document.getElementById('confirmPassword').value;
    const data= {
        passwordCurrent:oldPassword, password:newPassword, confirmPassword
    };
    updateMe('password', data)
})


