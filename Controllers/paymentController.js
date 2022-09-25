const stripe= require('stripe')("sk_test_51LioFWJY0k3RC20gFdTU1dONO1E2ezc0vno0wfeQTzxLLSjUerlLm3sL5CGvb4hXOGO2rG45qwMvbAXbKbxdT6zx00381EBAbG")
const AppError= require('../utils/appError')
const catchAsync= require('../utils/catchAsync')
const Apartment= require('../Models/apartmentModel')
const Payment= require('../Models/paymentModel')

exports.getCheckoutSession= catchAsync(async (req, res, next)=>{

    //Check the current apartment
    const apartment= await Apartment.findById(req.params.apartmentID)

    //create checkout session
    const session= await stripe.checkout.sessions.create({
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data:{
                    name: `${apartment.name}`,
                    images: [
                        'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                      ]
                }, 
                unit_amount: apartment.price * 100,

            },
            quantity:1
        }],
        mode: 'payment',
        success_url:`${req.protocol}://${req.get('host')}/?apartment=${req.params.apartmentID}&user=${res.locals.user.id}&price=${apartment.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/${apartment.slug}`,
        customer_email: res.locals.user.email
    });
    console.log(req.params.apartmentID)

    //Send to client 
    res.status(200).json({
        status: 'success',
        session
    })

});


exports.createPaymentCheckout= catchAsync(async (req, res, next)=>{
    const {apartment, user, price}= req.query;

    if(!apartment && !user && !price) return next();

    const payment= await Payment.create({apartment, user, price});

    res.redirect(req.originalUrl.split('?')[0])

});