const review= async(apartment, message, rating)=>{
    try{
        const res= await axios({
            method: 'POST',
            url: '/api/v1/apartments/${apartment}/reviews',
            data: {
                comment: message,
                rating
            },

        });
        if ((res.data.status = 'success')) location.reload(true);

    }catch(err){
        alert({ error: err.response.data})
    }
};

document.getElementById('review').addEventListener('click', e=>{
    e.preventDefault()
    const apartment= e.target.dataset.apartmentId
    const message= document.getElementById('message').value
    const rating= document.getElementById('rating').value

    review(apartment, message, rating)
})