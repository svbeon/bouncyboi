/* global createCanvas, keyIsDown, random, clear, fill, strokeWeight, stroke, rect, frameRate, resizeCanvas, abs  */
/* global SHIFT, UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, width, height, touches, mouseIsPressed, mouseX, mouseY */

let position = { x: (window.innerWidth / 2) - 25, y: (window.innerHeight / 2) - 25 }
let modifiers = { x: 10, y: -10, color: [3, 3, 3] }
let frictions = { x: -0.8, y: -0.8 }
let gravity = 0.25
let pristine = true
let color = [255, 0, 0]
let debug = false
let change = 0.5
let started = false

function setup () {
  frameRate(60)
  createCanvas(window.innerWidth, window.innerHeight)
}

function draw () {
  if (started) {
    if (keyIsDown(67)) clear() // c
    if (touches.length === 2) clear()

    if (keyIsDown(68)) debug = true // d
    if (keyIsDown(80)) pauseGame() // p
    if (keyIsDown(SHIFT) && keyIsDown(68)) debug = false
    if (touches.length === 3) debug = true
    if (touches.length === 4) debug = false
    if (touches.length === 5) pauseGame()

    // accelerate on keyboard input
    if (keyIsDown(LEFT_ARROW)) modifiers.x -= change
    if (keyIsDown(RIGHT_ARROW)) modifiers.x += change
    if (keyIsDown(UP_ARROW)) modifiers.y -= change
    if (keyIsDown(DOWN_ARROW)) modifiers.y += change

    // accelerate on mouse and touch input
    if (mouseIsPressed) {
      if (position.x + 25 > mouseX + 50 && abs(position.x - mouseX) > abs(position.y - mouseY)) modifiers.x -= change
      if (position.x + 25 < mouseX - 50 && abs(position.x - mouseX) > abs(position.y - mouseY)) modifiers.x += change
      if (position.y + 25 > mouseY + 50 && abs(position.y - mouseY) > abs(position.x - mouseX)) modifiers.y -= change
      if (position.y + 25 < mouseY - 50 && abs(position.y - mouseY) > abs(position.x - mouseX)) modifiers.y += change
    }

    // remove pristine status if arrow key is pressed.
    // if (pristine) before the rest makes the statement
    // use less processor cycles when pristine is false
    if (pristine &&
      (keyIsDown(UP_ARROW) ||
      keyIsDown(DOWN_ARROW) ||
      keyIsDown(LEFT_ARROW) ||
      keyIsDown(RIGHT_ARROW) ||
      mouseIsPressed ||
      touches.length > 0)) {
      pristine = false
    }
  }

  // add gravity down if the box is in the air
  // keep adding gravity when the box touches the floor
  // to make sure it bounce. but not if the velocity is so
  // small that it'd stay still
  if (modifiers.y >= gravity * -frictions.y ||
    modifiers.y <= gravity * frictions.y ||
    position.y < height - 50) {
    modifiers.y += gravity
  }

  // update position of box based on velocities
  position.x += modifiers.x
  position.y += modifiers.y

  // stop box from going out of bounds and bounce it against walls,
  // except if the arrow key towards the wall is pressed
  if (position.x <= 0) {
    position.x = 0
    if (keyIsDown(LEFT_ARROW)) modifiers.x = 0
    modifiers.x *= frictions.x
  }
  if (position.x >= width - 50) {
    position.x = width - 50
    if (keyIsDown(RIGHT_ARROW)) modifiers.x = 0
    modifiers.x *= frictions.x
  }
  // slowly stopp the ball if it slides on the floor
  if (position.y >= height - 50) modifiers.x *= -frictions.x
  // stop moving entirely if the velocity is really small
  if (modifiers.x < gravity * -frictions.x &&
    modifiers.x > gravity * frictions.x) modifiers.x = 0

  // uncomment to allow box to fly high
  /* if (position.y <= 0) {
    position.y = 0
    modifiers.y = 0
  } */
  // bounce box if it touches the floor
  if (position.y >= height - 50) {
    position.y = height - 50
    if (keyIsDown(DOWN_ARROW)) modifiers.y *= -frictions.y
    modifiers.y *= frictions.y
  }
  // stop bounce if small
  if (modifiers.y < gravity * -frictions.y &&
    modifiers.y > gravity * frictions.y) modifiers.y = 0

  // change colour of the box
  let rand = random([0, 1, 2])
  color[rand] += modifiers.color[rand]
  if (color[rand] > 255) color[rand] = 255
  if (color[rand] < 0) color[rand] = 0
  if (color[rand] >= 255 || color[rand] <= 0) modifiers.color[rand] *= -1

  // draw the box
  // rect(position.x - 1, position.y - 1, 52, 52) // white
  fill(color[0], color[1], color[2])
  strokeWeight(1)
  stroke(255, 255, 255)
  rect(position.x, position.y, 50, 50) // `rgb(${color.join(', ')})`

  // status
  if (started) {
    let status = document.getElementById('status')
    status.innerHTML = ''
    if (debug) {
      status.innerHTML += `x: ${position.x}, y: ${position.y}\n`
      status.innerHTML += `vx: ${modifiers.x}, vy: ${modifiers.y}\n`
      status.innerHTML += `color: [${color.join(', ')}]\n`
      status.innerHTML += `color modifiers: [${modifiers.color.join(', ')}]\n`
      status.innerHTML += `fps: ${frameRate()}\n`
      status.innerHTML += `touches: [${touches.map(touch => `\n  x: ${touch.x}, y: ${touch.y}`).join('')}${touches.length ? '\n' : ''}]\n`
      status.innerHTML += `mousePressed: ${mouseIsPressed}\n`
      status.innerHTML += `mX: ${mouseX}, mY: ${mouseY}\n`
    }
    status.innerHTML += `${pristine ? 'Use the arrow keys, or a touch screen to control the square' : ''}\n`
    status.innerHTML += `${pristine ? 'press c or two fingers to clear the screen' : ''}\n`
    status.innerHTML += `${pristine ? 'press d or three fingers to display debug' : ''}\n`
    status.innerHTML += `${pristine ? 'press shift+d or four fingers to hide debug' : ''}\n`
  }
}

function windowResized () {
  resizeCanvas(window.innerWidth, window.innerHeight)
}

function startGame () {
  started = true
  document.getElementsByTagName('body')[0].classList.add('started')
}

function pauseGame () {
  started = false
  document.getElementsByTagName('body')[0].classList.remove('started')
}

// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`)

// We listen to the resize event
window.addEventListener('resize', () => {
  // We execute the same script as before
  let vh = window.innerHeight
  document.documentElement.style.setProperty('--vh', `${vh}`)
})
