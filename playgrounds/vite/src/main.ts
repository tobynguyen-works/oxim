import img0 from './assets/img_0.png'
import img1 from './assets/img_1.jpg'
import img2 from './assets/img_2.png'
import img3 from './assets/img_3.avif'
import img4 from './assets/img_4.webp'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <img src="${img0}" />
    <img src="${img1}" />
    <img src="${img2}" />
    <img src="${img3}" />
    <img src="${img4}" />
  </div>
`
