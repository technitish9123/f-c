import React from 'react';
const RazorpayCheckout=()=>{
const loadScript= (src)=>{
    return new Promise ((resolve)=>{
        const script= document.createElement('script')
        script.src= src;
        script.onload=()=>{
            resolve (true)
        }

        script.onerror=()=>{
                resolve(false)
        }
        document.body.appendChild(script)
    })
}
const displayRazorpay= async (amount)=>{
    const res = await  loadScript("https://checkout.razorpay.com/v1/checkout.js")

    const options={
        key:"",
        currency:"INR",
        amount: 5000,
        name:"testing",
        des:"helkllo",
        handler: function(response){
            alert(response.razorpay_payment_id)
            alert("payment is successfull")
        }
        
    }
    const paymentObject =new window.Razorpay(options);
        paymentObject.open();
}
    return(
        <div>
                <button onClick={displayRazorpay}/>
                helloasljdlllllllllllllllllllllllllllllllllllll
        </div>
    )
}


export default RazorpayCheckout;
