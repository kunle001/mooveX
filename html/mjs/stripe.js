const stripe= Stripe("pk_test_51LioFWJY0k3RC20gWNzyn0zRoDFkAxIo1gTw45VIp4sW2GvmVbNWQJkxRKNT4wz38wjhK1RzeAtVi0u8uWnOhq1U00i3OLVHbc")

const bookTour= async apartmentID=>{
    try{
    // Get checkout-session from API
    const session = await axios({
        url: `http://127.0.0.1:3000/api/v1/payments/checkout-session/${apartmentID}`
    });
    //Create check-out form + charge credit card 

    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    });

    }catch(err){
        console.log(err)
        alert(err)
    }


};


document.getElementById('booking').addEventListener('click', e=>{
    e.target.textContent= 'Processing...'
    const apartmentID= e.target.dataset.apartmentId
    bookTour(apartmentID)
})