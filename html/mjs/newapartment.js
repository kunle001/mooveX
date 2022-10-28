const createApartment= async(apartmentType,type,bathrooms,garage,pools,rooms,gender,address
    ,coordinates,summary,secretApartment,price, name)=>{
    try{
        const res= await axios({
            method: 'POST',
            url: '/api/v1/apartments',
            data:{
                apartmentType,
                type,bathrooms,
                garage,pools,
                rooms,gender,
                address,
                coordinates,summary,
                secretApartment,price
            }


        })
        window.setTimeout(()=>{
            location.assign('/:slug')
        }, 500)
    }catch(err){
        console.error(err.response.data)
    }
}
document.getElementById('create').addEventListener('click', e=>{

    const name= document.getElementById('name').value
    const apartmentType= document.getElementById('apartmentType').value
    const type = document.getElementById('Type').value
    const bathrooms= document.getElementById('bathrooms').value
    const garage= document.getElementById('garage').value
    const pools= document.getElementById('pools').value
    const gender= document.getElementById('gender').value
    const address= document.getElementById('address').value
    const coordinates= document.getElementById('coordinates').value
    const summary= document.getElementById('summary').value
    const secretApartment= document.getElementById('pools').value
    const price= document.getElementById('price').value

    createApartment(apartmentType,type,bathrooms,garage,pools,rooms,gender,address
        ,coordinates,summary,secretApartment,price,name)

    const form = new FormData()

    form.append('name', name)
    form.append('apartmentType', apartmentType)
    form.append('type', type)
    form.append('summary', summary)
    form.append('price', price)
    form.append('gender', gender)
    form.append('name', name)
}) 