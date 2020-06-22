export const generateMessage = (username,text)=>{
    return {
        username,
        text,
        createAt:new Date().getTime()
    }
}

export const generateLocationMessage =(username,url)=>{
    return {
        username,
       url,
       createAt:new Date().getTime()
    }
}