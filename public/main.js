const socket = io()
const inputField = document.querySelector('.message_form__input')
const messageForm = document.querySelector('.message_form')
const messageBox = document.querySelector('.message__history')
const fallback = document.querySelector('.fallback')
const inboxPeople = document.querySelector('.inbox_people')

const addNewMessage = ({ user, message}) => {
  const time = new Date()
  const formatted = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric' })

  const receivedMsg = `
    <div class="incoming__message">
      <div class="received__message">
        <p>${message}</p>
        <div class="message__info">
          <span class="message__author">${user} </span>
          <span class="time_date">${formatted}</span>
        </div>
      </div>
    </div>
  `
  
  const myMsg = `
    <div class="outgoing__message">
      <div class="sent__message">
        <p>${message}</p>
        <div class="message__info">
          <span class="time_date">${formatted}</span>
        </div>
      </div>
    </div>
  `


  messageBox.innerHTML += user === userName ? myMsg : receivedMsg
}

messageForm.addEventListener('submit', e => {
  e.preventDefault()
  if (!inputField.value) {
    return
  }

  socket.emit('chat message', {
    message: inputField.value,
    nick: userName
  })

  inputField.value = ''
})

socket.on('chat message', data => {
  addNewMessage({ user: data.nick, message: data.message})
})
let userName = ''

const newUserConnected = (user) => {
  userName = user || `User${Math.floor(Math.random() * 1000000)}`

  socket.emit('new user', userName)
  addToUsersBox(userName)
}

const addToUsersBox = userName => {
  if(!!document.querySelector(`.${userName}-userlist`)) {
    return;
  }

  const userBox = `
    <div class='chat_ib ${userName}-userlist'>
      <h5>${userName}</h5>
    </div>
  `

  inboxPeople.innerHTML += userBox;
}

newUserConnected()

socket.on('new user', data => {
  data.map(user => addToUsersBox(user))
})

socket.on('user disconnected', userName => {
  document.querySelector(`.${userName}-userlist`).remove()
})

inputField.addEventListener('keyup', () => {
  socket.emit('typing', {
    isTyping: inputField.value.length > 0,
    nick: userName
  })
})

socket.on('typing', data => {
  const { isTyping, nick } = data;

  if(!isTyping) {
    fallback.innerHTML = ''
    return
  }

  fallback.innerHTML = `<p>${nick} is typing...</p>`
})

