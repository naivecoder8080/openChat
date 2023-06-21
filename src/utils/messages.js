const generateMessage=(username,text)=>{
    return {
        username,
        text,
        createdAt:new Date().getTime()
    }
}

const generateLocationMessage=(username,location)=>{
    url=`https://google.com/maps?q=${location.latitude},${location.longitude}`
    return {
        username,
        url,
        createdAt:new Date().getTime()
    }
}

module.exports={
    generateMessage,
    generateLocationMessage
}