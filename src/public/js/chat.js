const socket = io();
const button = document.querySelector('#send')
const buttonLocation = document.querySelector("#send-location");
const message = document.querySelector('#message')
const messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const {username, room} =Qs.parse(location.search,{ignoreQueryPrefix:true});

const autoscroll = ()=>{

    //

    const newMessage  = messages.lastElementChild
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHight = newMessage.offsetHeight +newMessageMargin;
    

    const visibleHeight =  messages.offsetHeight;

    const containerHeight = messages.scrollHeight;

    const scrollOffset = messages.scrollTop+visibleHeight;

    if(containerHeight - newMessageHight<=scrollOffset){
       messages.scrollTop = messages.scrollHeight
    }

    console.log(newMessageStyles)

}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createAt:moment(message.createAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll();

})

socket.on('locationMessage',(message)=>{
    const html = Mustache.render(locationMessageTemplate,{
      username:message.username,
      location:message.url,
      createAt:moment(message.createAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
   
})

socket.on('roomUsers',({room,users})=>{
   const html = Mustache.render(sidebarTemplate,{
       room,
       users
   })

   document.querySelector("#sidebar").innerHTML=html;
})

button.addEventListener('click', (e) => {

    e.preventDefault();
    button.setAttribute('disabled', 'disabled')
    socket.emit('sendMessage', message.value, (error) => {
        button.removeAttribute('disabled')
        message.value = "";
        if (!error) {
            return console.log(error)
        }

        console.log('Message delivered')
    })
})

buttonLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocations is not supporting by yourbrowser')
    }
    buttonLocation.setAttribute('disabled', 'disabled')


    navigator.geolocation.getCurrentPosition((position) => {

        let obj = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', obj, (message) => {
            buttonLocation.removeAttribute('disabled')
            console.log(message)
        })
    });
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error);
        location.href ='/'
    }
});