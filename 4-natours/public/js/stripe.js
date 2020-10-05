import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe('pk_test_51HXPHVF1X065rUCbo8Q6BbkRWp7PkCjkZALqnKpQjRKKKgW9OsfEgcCh18x1c26IBZRNEjGHngtWit1T7wG8E7m900ZLzhN0mZ'); 

export const bookTour = async tourId => { 
    try{ 
        // 1) get checkout session from our API
    const session= await axios(`/api/v1/bookings/checkout-session/${tourId}`); 
    // console.log(session);

    // 2) create checkout form and charge our api
    await stripe.redirectToCheckout({ 
        sessionId: session.data.session.id
    })
    }catch(err){ 
        console.log(err);
        showAlert('Error', err)
    }
}