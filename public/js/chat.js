const socket = io()

//Elements 
const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')
const sendLocationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

//option 
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const newMessage = messages.lastElementChild

    //Height of last message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = messages.offsetHeight

    //Height of messages container 
    const conatainerHeight = messages.scrollHeight

    //how far scrolled
    const scrollOffSet = messages.scrollTop + visibleHeight

    if (conatainerHeight - newMessageHeight <= scrollOffSet) {
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        text: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

/////////////////////////////////////////////////////////////////////////

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

///////////////////////////////////////////////////////////////////////
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

///////////////////////////////////////////////////////////////////////

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    messageFormButton.setAttribute('disabled', 'disabled')
    const message = document.querySelector('input').value
    socket.emit('sendMessage', message, (msg) => {
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value = ''
        messageFormInput.focus()

        console.log('Message delivered')

    })
})

///////////////////////////////////////////////////////////////////////////
sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported bu your browser!')
    }
    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared')
        })
    })
})

/////////////////////////////////////////////////////////////////////////////

socket.emit('join', { username, room }, (error) => {
    console.log(username, room)
    if (error) {
        alert(error)
        location.href = '/'
    }
})