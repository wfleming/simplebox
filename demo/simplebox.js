import {SimpleBox} from "../lib/index.mjs"
SimpleBox()

function cloneLink(el) {
  const dupe = el.cloneNode(true)
  dupe.setAttribute("data-simplebox", "")
  dupe.setAttribute("rel", "dynamically-added")
  return dupe
}

const addNodesbtn = document.querySelector("button[data-action=add-nodes]")
addNodesbtn.addEventListener("click", ev => {
  const parent = ev.target.closest("div")
  const newEls = []

  const allLinks = Array.from(document.querySelectorAll('[data-simplebox]'))

  // add first 5 directly
  allLinks.slice(0,4).forEach(link => {
    newEls.push(cloneLink(link))
  })

  // add next 5 inside a different div
  const div = document.createElement("div")
  allLinks.slice(5,9).forEach(link => {
    const n = link.cloneNode(true)
    div.appendChild(cloneLink(link))
  })
  newEls.push(div)

  newEls.forEach(el => parent.appendChild(el))
})
