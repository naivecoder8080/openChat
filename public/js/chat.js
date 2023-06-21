const socket=io();

//Elements
const $messageForm=document.querySelector('form');
const $messsageFormInput=$messageForm.querySelector('input');
const $messageFormButton=$messageForm.querySelector('button');
const $sendLocationButton=document.querySelector('#send-location');
const $messages=document.querySelector('#messages');

//Templates
const $messageTemplate=document.querySelector('#message-template').innerHTML
const $locationMessageTemplate=document.querySelector('#location-message-template').innerHTML;
const $sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;

//Options
const {username,room}=Object.fromEntries(new URLSearchParams(location.search))


//autoscrolling implementation
const autoScroll=()=>{
    const $newMessage=$messages.lastElementChild;

    const newMessageStyles=getComputedStyle($newMessage);
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight + newMessageMargin;

    const visibleHeight=$messages.offsetHeight;

    const containerHeight=$messages.scrollHeight;
    const scrollOffset=$messages.scrollTop+visibleHeight

    if(containerHeight-newMessageHeight<=Math.ceil(scrollOffset)){
        $messages.scrollTop=$messages.scrollHeight;
    }
}

//listening to messages
socket.on('message',(message)=>{
    console.log(message);
   
    const html=Mustache.render($messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    });
    
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

//listening for roomData
socket.on('roomData',({room,users})=>{
    const html=Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html;
})

//sending message
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    const message=e.target.elements.message.value;
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled');
        $messsageFormInput.value='';
        $messsageFormInput.focus();
        
        if(error)
        return console.log(error);

        console.log("Message Delivered!");
    });
})


//sending location
$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation)
    return alert('Your browser does not support sharing location');
    $sendLocationButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{

            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})

//listening for location
socket.on('locationMessage',(message)=>{
    console.log(message.url)

    const html=Mustache.render($locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll();
})

//sending join requests
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href="/";
    }
});

